import { Routes } from '@angular/router';
import { authGuardFn } from '@auth0/auth0-angular';
import { ensureSameUserWithDesignServiceGuardFn } from './core/guards';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./pages/chat-page').then(x => x.ChatPageRoutes),
        canActivate: [authGuardFn, ensureSameUserWithDesignServiceGuardFn],
    },
];
