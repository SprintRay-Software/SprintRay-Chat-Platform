import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { debounce, filter, firstValueFrom, interval, map, shareReplay, Subject, switchMap, takeUntil } from 'rxjs';
import { environment } from '../../../environments';
import { v4 as uuidv4 } from 'uuid';
import { AppSyncRealTimeSubscriptionHandshakeLink } from 'aws-appsync-subscription-link/lib/realtime-subscription-handshake-link';
import { delay } from '../utils';
import { AUTH_TYPE, AWSAppSyncClient, AWSAppSyncClientOptions, createAppSyncLink } from 'aws-appsync';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from '../../lib/apollo';
import { AuthService } from '@auth0/auth0-angular';

let wsConnectionClosed = new EventEmitter<void>();
let wsConnectionOpened = new EventEmitter<void>();

const MAX_RECONNECT_COUNT = 3;
const { createWebSocket } = AppSyncRealTimeSubscriptionHandshakeLink;
let activeWebsocket: WebSocket | null | undefined;
let appsyncRealTimeLink: AppSyncRealTimeSubscriptionHandshakeLink & { isReconnecting: boolean; reconnect: () => any };
let initializeHandshakePromise: Promise<any> | null;
// @ts-ignore
AppSyncRealTimeSubscriptionHandshakeLink.prototype['reconnect'] = async function (this: any) {
    const _reconnect = async () => {
        // @ts-ignore
        this.socketStatus = 0;
        // @ts-ignore
        this.failedReconnect = false;

        // @ts-ignore
        const { subscriptionObserverMap } = this;
        if (subscriptionObserverMap.size <= 0) return true;
        const subscriptionIds = subscriptionObserverMap.keys();

        for (let subscriptionId of subscriptionIds) {
            if (!subscriptionId) continue;
            const { variables, query, observer } = this.subscriptionObserverMap.get(subscriptionId);

            await this._startSubscriptionWithAWSAppSyncRealTime({
                options: {
                    appSyncGraphqlEndpoint: this.url,
                    authenticationType: this.auth.type,
                    query,
                    region: this.region,
                    variables,
                    apiKey: this.auth.type === AUTH_TYPE.API_KEY ? this.auth.apiKey : '',
                    credentials: this.auth.type === AUTH_TYPE.AWS_IAM ? this.auth.credentials : null,
                    jwtToken:
                        this.auth.type === AUTH_TYPE.AMAZON_COGNITO_USER_POOLS ||
                        this.auth.type === AUTH_TYPE.OPENID_CONNECT
                            ? this.auth.jwtToken
                            : null,
                },
                observer,
                subscriptionId,
            });
        }

        return this.awsRealTimeSocket.readyState === WebSocket.OPEN;
    };

    let reconnectCount = 0;
    let reconnected = false;
    this.isReconnecting = true;
    while (reconnectCount++ < MAX_RECONNECT_COUNT && !reconnected) {
        console.warn('[awsRealTimeSocket] reconnecting..., ', reconnectCount);
        reconnected = await _reconnect().catch(e => {
            console.warn(e);
            return false;
        });
        if (!reconnected) await delay(1000);
    }
    this.failedReconnect = !reconnected;
    this.isReconnecting = false;
};
// @ts-ignore
AppSyncRealTimeSubscriptionHandshakeLink.prototype['_timeoutDisconnect'] = function (this: any) {
    if (this.awsRealTimeSocket) {
        this.awsRealTimeSocket.close();
    }

    this.socketStatus = 0;
};
AppSyncRealTimeSubscriptionHandshakeLink.prototype['_timeoutStartSubscriptionAck'] = function (
    this: any,
    subscriptionId: any
) {
    const { observer, query, variables } = this.subscriptionObserverMap.get(subscriptionId);
    this.subscriptionObserverMap.set(subscriptionId, {
        observer,
        query,
        variables,
        subscriptionState: 2 /** SUBSCRIPTION_STATUS.FAILED */,
    });
};
AppSyncRealTimeSubscriptionHandshakeLink.prototype['_initializeRetryableHandshake'] = function (
    this: any,
    { awsRealTimeUrl }: { awsRealTimeUrl: string }
) {
    appsyncRealTimeLink = this;
    if (initializeHandshakePromise) return initializeHandshakePromise;
    return (initializeHandshakePromise = this._initializeHandshake({ awsRealTimeUrl }).then(
        () => (initializeHandshakePromise = null),
        () => (initializeHandshakePromise = null)
    ));
};
const listeners = {
    close: (ev?: CloseEvent) => {
        console.warn(
            `[awsRealTimeSocket, websocket] close; code: ${ev?.code ?? 0}, reason:${ev?.reason ?? 'unknown'}, wasClean: ${
                ev?.wasClean ?? false
            }, type: ${ev?.type}`
        );
        wsConnectionClosed.emit();
    },
    error: (ev: any) => {
        console.warn('[awsRealTimeSocket, websocket] error', ev);
    },
    open: () => {
        console.warn('[awsRealTimeSocket, websocket] open');
        wsConnectionOpened.emit();
    },
} as const;
AppSyncRealTimeSubscriptionHandshakeLink['createWebSocket'] = function () {
    if (activeWebsocket) {
        for (const k in listeners) {
            // @ts-ignore
            activeWebsocket.removeEventListener(k, listeners[k]);
        }
    }
    // @ts-ignore
    const socket = createWebSocket?.call(this, ...arguments);
    activeWebsocket = socket;
    console.warn('[awsRealTimeSocket, websocket] created ');
    if (socket != null) {
        for (const k in listeners) {
            // @ts-ignore
            socket.addEventListener(k, listeners[k]);
        }
    }
    return socket;
};

@Injectable({ providedIn: 'root' })
export class AppsyncClient implements OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private reconnectCount = 0;

    readonly wsConnectionClosed = wsConnectionClosed.pipe(shareReplay(1));
    readonly wsConnectionOpened = wsConnectionOpened.pipe(shareReplay(1));
    readonly reconnectFailed = new Subject<boolean>();

    private readonly _client: AWSAppSyncClient<any>;
    private readonly clientConfig: AWSAppSyncClientOptions = {
        url: environment.appSyncGraphQLEndpoint,
        region: environment.appSyncRegion,
        disableOffline: true,
        auth: {
            type: AUTH_TYPE.OPENID_CONNECT,
            jwtToken: () =>
                firstValueFrom(
                    this._authService.isAuthenticated$.pipe(
                        filter(v => v),
                        switchMap(() => this._authService.getAccessTokenSilently())
                    )
                ),
        },
    };

    constructor(
        private readonly _authService: AuthService,
        private readonly _apolloHttpLink: HttpLink
    ) {
        this._client = new AWSAppSyncClient(
            {
                ...this.clientConfig,
                offlineConfig: { keyPrefix: `${String(uuidv4())}:${new Date().getTime().toString()}` },
            },
            { link: ApolloLink.from([this.getRefreshLink(), this.getSyncLink()]) }
        );

        this.wsConnectionClosed
            .pipe(
                filter(() => !appsyncRealTimeLink['isReconnecting'] && this.reconnectCount <= MAX_RECONNECT_COUNT),
                debounce(() => (this.reconnectCount > 0 ? interval(1000) : interval(0))),
                takeUntil(this.destroy$)
            )
            .subscribe(async () => {
                // await this.ensureAuthTokenAlive();

                this.reconnectCount++;
                console.warn('[awsRealTimeSocket, websocket] wsConnectionClosed triggered ', this.reconnectCount);
                const reconnectTimeoutId = setTimeout(() => {
                    clearTimeout(reconnectTimeoutId);
                    if (activeWebsocket?.readyState !== WebSocket.OPEN) {
                        this.reconnectFailed.next(true);
                    }
                }, 3000);
                appsyncRealTimeLink['reconnect']().then(() => {
                    clearTimeout(reconnectTimeoutId);
                    if (activeWebsocket?.readyState !== WebSocket.OPEN) {
                        this.reconnectFailed.next(true);
                    } else {
                        this.reconnectFailed.next(false);
                    }
                });
            });

        this.wsConnectionOpened
            .pipe(
                filter(() => this.reconnectCount > 0),
                takeUntil(this.destroy$)
            )
            .subscribe(() => this.resetReconnectCount());
    }

    private get activeWebsocket() {
        return activeWebsocket;
    }

    get client() {
        return this._client.hydrated();
    }

    pingWithDelay(delayTimeoutMs = 5000) {
        if (this.activeWebsocket) {
            switch (activeWebsocket!.readyState) {
                case WebSocket.OPEN:
                    try {
                        let closed = false;
                        const pongTimeout = setTimeout(() => {
                            clearTimeout(pongTimeout);
                            wsConnectionClosed.emit();
                            closed = true;
                        }, delayTimeoutMs);
                        this.activeWebsocket.addEventListener(
                            'message',
                            () => {
                                clearTimeout(pongTimeout);
                                if (closed) {
                                    wsConnectionOpened.emit();
                                }
                                console.warn('[awsRealTimeSocket] pong');
                            },
                            { once: true }
                        );
                        this.activeWebsocket.send('__ping__');
                    } catch (e) {
                        console.warn('awsRealTimeSocket.send failed ', e);
                    }
                    break;
                case WebSocket.CLOSING:
                case WebSocket.CLOSED:
                    wsConnectionClosed.emit();
                    break;
            }
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    protected resetReconnectCount() {
        console.warn('[awsRealTimeSocket] reset reconnecting count');
        this.reconnectCount = 0;
    }

    private getSyncLink() {
        return createAppSyncLink({
            ...this.clientConfig,
            complexObjectsCredentials: null as any,
            resultsFetcherLink: this._apolloHttpLink.create({ uri: environment.appSyncGraphQLEndpoint }),
        });
    }

    private getRefreshLink(): TokenRefreshLink {
        return new TokenRefreshLink({
            isTokenValidOrUndefined: v => {
                return true;
            },
            fetchAccessToken: () =>
                firstValueFrom(
                    this._authService.isAuthenticated$.pipe(
                        filter(x => !!x),
                        switchMap(() => this._authService.getAccessTokenSilently()),
                        map(t => new Response(t))
                    )
                ),
            handleFetch: _ => {},
            handleResponse: (operation, accessTokenField) => (response: Response) => {
                response.text().then(
                    tokensJson => {},
                    _ => {}
                );
            },
            handleError: err => {},
        });
    }
}
