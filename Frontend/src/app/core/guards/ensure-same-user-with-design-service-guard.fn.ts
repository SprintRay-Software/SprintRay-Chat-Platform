import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ExtendedAuthService } from '../services';
import { AuthService } from '@auth0/auth0-angular';
import { filter, firstValueFrom } from 'rxjs';
import { AuthConstants } from '../constants';

/**
 * Make sure this site is share same user with dashboard.sprintray.com
 */
export const ensureSameUserWithDesignServiceGuardFn: CanActivateFn = async () => {
    const extendedAuthService = inject(ExtendedAuthService);
    const authService = inject(AuthService);
    await firstValueFrom(authService.isAuthenticated$.pipe(filter(v => v)));
    await extendedAuthService.ensureSameUserWithDesignService().catch(e => {
        if (e['code'] === AuthConstants.auth0ErrorCodes.loginRequired) {
            authService.logout({ logoutParams: { returnTo: window.origin } });
        }
    });
    return true;
};
