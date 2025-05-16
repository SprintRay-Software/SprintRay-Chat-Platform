import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import auth0 from 'auth0-js';
import { environment } from '../../../environments';
import { isString } from 'lodash-es';
import { filter, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExtendedAuthService {
    private readonly _webAuth = new auth0.WebAuth({
        clientID: environment.auth.clientId,
        domain: environment.auth.domain,
        audience: environment.auth.audience,
        scope: environment.auth.scope,
        responseType: environment.auth.responseType,
        responseMode: 'web_message',
        redirectUri: window.location.href,
    });

    constructor(private readonly _authService: AuthService) {}

    get authService() {
        return this._authService;
    }

    async ensureSameUserWithDesignService() {
        await firstValueFrom(this.authService.isAuthenticated$.pipe(filter(isAuthenticated => isAuthenticated)));
        const { sub } = (await firstValueFrom(this.authService.user$)) ?? {};
        const webAuthToken = await new Promise<string | null>((resolve, reject) => {
            this._webAuth.checkSession({}, (error, result) => {
                if (error) {
                    console.warn('auth0 failed to check session', JSON.stringify(error));
                    reject(error);
                    return;
                }

                const { accessToken } = result ?? {};
                resolve(isString(accessToken) ? accessToken : null);
            });
        });
        if (webAuthToken == null) {
            return;
        }

        const webAuthTokenPayload = webAuthToken.split('.')[1];
        if (webAuthTokenPayload) {
            const webAuthSub = JSON.parse(atob(webAuthTokenPayload))['sub'];
            if (webAuthSub !== sub) {
                await firstValueFrom(this.authService.getAccessTokenSilently({ cacheMode: 'off' }));
            }
        }
    }
}
