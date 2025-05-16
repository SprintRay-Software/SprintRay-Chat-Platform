import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@auth0/auth0-angular';
import { map } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'sr-chat-land',
    standalone: true,
    imports: [MatIcon, TranslateModule, AsyncPipe],
    templateUrl: './chat-land.component.html',
    styleUrl: './chat-land.component.scss',
})
export class ChatLandComponent {
    readonly user$ = this._authService.user$;
    readonly fullName$ = this._authService.user$.pipe(map(u => u?.name));

    constructor(private readonly _authService: AuthService) {}
}
