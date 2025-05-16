import { inject, Injectable, OnDestroy } from '@angular/core';
import {
    BehaviorSubject,
    distinctUntilChanged,
    filter,
    first,
    from,
    map,
    Observable,
    of,
    shareReplay,
    Subject,
    Subscriber,
    Subscription,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs';
import {
    ChatBotActions,
    ChatSessionStatus,
    Message,
    MessageInput,
    MessageMetadataInput,
    Messages,
    MessageType,
} from '../models';
import { AppsyncClient } from '../clients';
import getConversationMessages from '../../graphql/queries/getConversationMessages';
import { getConversationMessagesQuery } from '../../graphql';
import subscribeToNewMessages from '../../graphql/queries/subscribeToNewMessages';
import { unshiftMessage } from '../utils';
import { last, omit, reverse } from 'lodash-es';
import { v4 as uuid } from 'uuid';
import createMessage from '../../graphql/mutations/createMessage';
import { AuthService, User } from '@auth0/auth0-angular';
import { environment } from '../../../environments';
import { differenceInMinutes, parseISO } from 'date-fns';

const firstPageSize = 2000;

export interface ConversationState {
    initializing: boolean;
    id: string;
    isWaitingAiResponse: boolean;
    isCreatingMessage: boolean;
    chatSessionStatus: ChatSessionStatus;
    sender?: string;
}

export const defaultConversationState: ConversationState = {
    id: uuid(),
    initializing: true,
    isWaitingAiResponse: false,
    isCreatingMessage: false,
    chatSessionStatus: ChatSessionStatus.inactive,
};

@Injectable()
export class ChatMessageService implements OnDestroy {
    readonly messages$ = new Observable<Readonly<Messages>>(subscriber => {
        // subscriber.next(MockMessages);

        const subscriptions: Subscription[] = [];
        const appsyncSubscriptions: Subscription[] = [];
        subscriptions.push(
            this.conversationId$
                .pipe(
                    filter((x): x is string => !!x),
                    distinctUntilChanged()
                )
                .subscribe(conversationId => {
                    appsyncSubscriptions.forEach(s => s.unsubscribe());
                    appsyncSubscriptions.splice(0, appsyncSubscriptions.length);
                    this.observeMessages(conversationId, subscriber, [], appsyncSubscriptions);
                })
        );

        return {
            unsubscribe() {
                subscriptions.forEach(s => s.unsubscribe());
                appsyncSubscriptions.forEach(s => s.unsubscribe());
            },
        };
    }).pipe(
        map(messages => {
            /**
             * Filter out messages after `ChatBotActions.closeSession` action globally
             */

            const closeSessionMessageIdx = messages.findIndex(
                x => x.metadata?.ai.action === ChatBotActions.closeSession
            );
            return messages.filter(
                (item, index) =>
                    closeSessionMessageIdx < 0 ||
                    closeSessionMessageIdx >= index ||
                    item?.metadata?.ai.action === ChatBotActions.submitSupportTicket ||
                    item?.metadata?.ai.action === ChatBotActions.submitScheduleCallback
            );
        }),
        shareReplay(1)
    );
    readonly messagesToDisplay$ = this.messages$.pipe(
        map(m =>
            m.filter(
                i =>
                    i.metadata == null ||
                    i.metadata.ai == null ||
                    !i.metadata.ai.action ||
                    ![
                        ChatBotActions.initialize,
                        ChatBotActions.closeSession,
                        ChatBotActions.submitSupportTicket,
                        ChatBotActions.submitScheduleCallback,
                    ].includes(i.metadata.ai.action)
            )
        )
    );

    readonly messagesTicket$ = this.messages$.pipe(
        map(m =>
            m.filter(
                message =>
                    message?.metadata?.ai.humanNeeded ||
                    message?.metadata?.ai.action === ChatBotActions.submitSupportTicket ||
                    message?.metadata?.ai.action === ChatBotActions.submitScheduleCallback
            )
        )
    );

    readonly conversationState$: Observable<ConversationState>;
    readonly conversationId$: Observable<string>;
    readonly chatSessionStatus$: Observable<ChatSessionStatus>;
    readonly initializing$: Observable<boolean>;

    private readonly _authService = inject(AuthService);
    private readonly _appsyncClient = inject(AppsyncClient);
    private readonly _conversationState$ = new BehaviorSubject<ConversationState>({ ...defaultConversationState });
    private readonly _destroyed$ = new Subject<void>();

    private _sessionTimeoutId?: any;

    constructor() {
        this.conversationState$ = this._conversationState$.asObservable();
        this.chatSessionStatus$ = this.conversationState$.pipe(map(s => s.chatSessionStatus));
        this.conversationId$ = this.conversationState$.pipe(map(x => x.id));
        this.initializing$ = this.conversationState$.pipe(map(x => x.initializing));

        this.messages$.pipe(takeUntil(this._destroyed$)).subscribe(m => {
            const lastMessage = last(m);
            const {
                _conversationState$: {
                    value: { isWaitingAiResponse, sender },
                },
            } = this;

            if (
                lastMessage &&
                lastMessage.metadata &&
                lastMessage.metadata.ai &&
                lastMessage.sender !== environment.aiBotMetadata.userId &&
                lastMessage.metadata.ai.action !== ChatBotActions.initialize
            ) {
                this.patchConversationState({ isWaitingAiResponse: true });
            }

            const chatSessionStatus = m.some(i => i.metadata?.ai.action === ChatBotActions.closeSession)
                ? ChatSessionStatus.inactive
                : ChatSessionStatus.active;
            this.patchConversationState({
                chatSessionStatus,
            });

            if (
                (lastMessage && lastMessage.sender === environment.aiBotMetadata.userId && isWaitingAiResponse) ||
                chatSessionStatus === ChatSessionStatus.inactive
            ) {
                this.patchConversationState({ isWaitingAiResponse: false });
            }

            if (chatSessionStatus === ChatSessionStatus.active && sender && lastMessage) {
                this.startSessionTimeout(lastMessage);
            }
        });
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    initConversation(
        conversationId: string,
        {
            initAiSession = false,
            sender,
        }: {
            initAiSession?: boolean;
            sender: string;
        }
    ) {
        this.patchConversationState({
            initializing: true,
            id: conversationId,
            sender,
        });
        return this._authService.user$.pipe(
            filter((x): x is User => !!x),
            first(),
            switchMap(u =>
                this._appsyncClient.wsConnectionOpened.pipe(
                    first(),
                    map(() => u)
                )
            ),
            switchMap(u =>
                initAiSession
                    ? this.createMessageToAiChatBot(
                          u.sub!,
                          conversationId,
                          '',
                          MessageType.Standard,
                          ChatBotActions.initialize
                      )
                    : of(null)
            ),
            tap(() => {
                this.patchConversationState({ initializing: false, id: conversationId });
            })
        );
    }

    createMessageToAiChatBot(
        sender: string,
        conversation: string,
        content: string,
        messageType: MessageType = MessageType.Standard,
        action = ChatBotActions.askQuestion,
        metadata?: Partial<Pick<MessageMetadataInput, 'supportTicket'>>
    ): Observable<unknown> {
        const {
            _conversationState$: {
                value: { isWaitingAiResponse, initializing, isCreatingMessage },
            },
        } = this;
        if (isWaitingAiResponse || isCreatingMessage) {
            console.error(
                `Forbid to create message, state: `,
                JSON.stringify({ isWaitingAiResponse, isCreatingMessage })
            );
            return of(null);
        }

        if (!initializing) this.patchConversationState({ isCreatingMessage: true });
        conversation = conversation ? conversation : uuid();
        return this.createMessage(sender, conversation, content, messageType, {
            ai: {
                isSentFromUser: true,
                chatId: conversation,
                action,
                options: {},
                status: '',
            },
            supportTicket: metadata?.supportTicket,
        }).pipe(
            tap(() => {
                this.patchConversationState({ isCreatingMessage: false });
            })
        );
    }

    createMessage(
        sender: string,
        conversation: string,
        content: string,
        messageType: MessageType = MessageType.Standard,
        messageMetadata?: MessageMetadataInput | null
    ) {
        const id = `${new Date().toISOString()}_${uuid()}`;
        const message: MessageInput = {
            conversationId: conversation,
            content: encodeURI(content),
            createdAt: id,
            sender: sender,
            isSent: false,
            id: id,
            hasFiles: false,
            messageType: messageType,
            messageMetadata,
        };

        return from(
            this._appsyncClient.client.then(client =>
                client.mutate({
                    mutation: createMessage,
                    variables: message,
                    optimisticResponse: () => ({
                        createMessage: {
                            __typename: 'Message',
                            ...omit(message, 'messageMetadata'),
                            metadata: {
                                __typename: 'MessageMetadata',
                                ...messageMetadata,
                                ai: {
                                    __typename: 'ChatBot',
                                    ...messageMetadata?.ai,
                                    status: null,
                                    options: {
                                        __typename: 'ChatBotOptions',
                                        category: null,
                                        setup_confirm: null,
                                        product: null,
                                    },
                                    humanNeeded: false,
                                    references: null,
                                    chatId: conversation,
                                },
                                supportTicket: null,
                                supportTicketResult: null,
                            },
                        },
                    }),

                    update: (proxy, { data: { createMessage: _message } }: any) => {
                        try {
                            const options = {
                                query: getConversationMessages,
                                variables: { conversationId: conversation, first: firstPageSize },
                            };

                            let readData: any = {
                                allMessageConnection: {
                                    messages: [],
                                    nextToken: null,
                                    __typename: 'AllMessageConnection',
                                },
                            };
                            try {
                                readData = proxy.readQuery(options) as any;
                            } catch (e) {
                                console.warn(e);
                            }
                            const _tmp = unshiftMessage(readData, _message);
                            proxy.writeQuery({ ...options, data: _tmp });
                        } catch (e) {
                            console.warn(e);
                        }
                    },
                })
            )
        );
    }

    closeSession(): Observable<unknown> {
        const { chatSessionStatus, isCreatingMessage, sender } = this._conversationState$.value;
        if (isCreatingMessage || chatSessionStatus !== ChatSessionStatus.active || !sender) return of(null);

        return this.conversationId$.pipe(
            first(),
            switchMap(conversation =>
                this.createMessage(sender, conversation, '', MessageType.Standard, {
                    ai: {
                        isSentFromUser: true,
                        action: ChatBotActions.closeSession,
                        chatId: conversation,
                        options: {},
                    },
                })
            ),
            tap(() => {
                this.patchConversationState({ isWaitingAiResponse: false });
            })
        );
    }

    private observeMessages(
        conversationId: string,
        subscriber: Subscriber<Readonly<Messages>>,
        messages: Messages,
        subscriptions: { unsubscribe: () => unknown }[]
    ) {
        this._appsyncClient.client.then(client => {
            const observable = client.watchQuery<getConversationMessagesQuery>({
                query: getConversationMessages,
                fetchPolicy: 'network-only',
                variables: {
                    conversationId: conversationId,
                    first: firstPageSize,
                },
            });

            subscriptions.push(
                observable.subscribe(({ data }) => {
                    if (!data || !data.allMessageConnection) return;

                    const firstData = messages.length === 0;
                    const newMessages = (data?.allMessageConnection?.messages ?? []).filter(
                        (m): m is Exclude<typeof m, null | undefined> =>
                            !!m &&
                            m.messageType !== MessageType.RequestApproval &&
                            m.messageType !== MessageType.DoctorRating
                    );
                    subscriber.next(
                        Object.freeze([
                            ...reverse(
                                newMessages.map(n => ({
                                    ...n,
                                    createdAt: n.createdAt?.split('_')?.[0] ?? new Date().toISOString(),
                                    id: n.id.split('_')[1],
                                }))
                            ),
                        ])
                    );
                }),
                {
                    unsubscribe: observable.subscribeToMore({
                        document: subscribeToNewMessages,
                        variables: { conversationId },
                        updateQuery: (
                            prev: getConversationMessagesQuery,
                            {
                                subscriptionData: {
                                    data: { subscribeToNewMessage: message },
                                },
                            }
                        ) => unshiftMessage({ ...prev }, message!),
                    }),
                }
            );
        });
    }

    private startSessionTimeout(lastMessage: Message) {
        if (this._sessionTimeoutId) {
            clearTimeout(this._sessionTimeoutId);
        }
        const now = new Date();
        const createdAt = parseISO(lastMessage.createdAt ?? now.toISOString());
        const timeoutMinutes = Math.max(61 - differenceInMinutes(now, createdAt), 0);

        this._sessionTimeoutId = setTimeout(
            () => {
                clearTimeout(this._sessionTimeoutId);

                this.closeSession().subscribe({
                    next: () => {},
                    error: console.error,
                });
            },
            timeoutMinutes * 60 * 1000
        );
    }

    private patchConversationState(newValue: Partial<ConversationState>) {
        this._conversationState$.next({ ...this._conversationState$.value, ...newValue });
    }
}
