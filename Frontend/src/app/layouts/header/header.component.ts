import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { environment } from '../../../environments';
import { RouterLink } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
    selector: 'sr-header',
    standalone: true,
    imports: [AvatarModule, CommonModule, MatIcon, RouterLink],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})
export class HeaderComponent {
    private readonly user$ = this._authService.user$;

    readonly authenticated$ = this._authService.isAuthenticated$;
    readonly avatarImage$ = this.user$.pipe(map(u => u?.picture));
    readonly avatarLabel$ = this.user$.pipe(
        map(u => (!u?.picture ? (u?.given_name?.[0] ?? '' + u?.family_name?.[0]) : undefined))
    );
    readonly dashboardLink = environment.dashboardLink;

    constructor(private readonly _authService: AuthService) {}
}
