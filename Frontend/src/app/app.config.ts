import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { authHttpInterceptorFn, provideAuth0 } from '@auth0/auth0-angular';
import { environment } from '../environments';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpLink } from './lib/apollo';
import { MatIconModule } from '@angular/material/icon';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';

function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideAuth0({
            domain: environment.auth.domain,
            clientId: environment.auth.clientId,
            httpInterceptor: {
                allowedList: [
                    {
                        uri: `${environment.apis.dashboard.baseUrl}${environment.apis.dashboard.basePath}/*`,
                        allowAnonymous: true,
                    },
                ],
            },
            useRefreshTokens: false,
            cacheLocation: 'localstorage',
            useRefreshTokensFallback: true,
            authorizationParams: {
                audience: environment.auth.audience,
                redirect_uri: window.origin,
            },
            authorizeTimeoutInSeconds: 120,
            httpTimeoutInSeconds: 120,
            legacySameSiteCookie: true,
        }),
        importProvidersFrom(
            TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useFactory: HttpLoaderFactory,
                    deps: [HttpClient],
                },
                defaultLanguage: 'en',
            }),
            MatIconModule,
            DialogModule
        ),
        provideAnimationsAsync(),
        { provide: HttpLink },
        provideHttpClient(withInterceptors([authHttpInterceptorFn])),
        DialogService,
    ],
};
