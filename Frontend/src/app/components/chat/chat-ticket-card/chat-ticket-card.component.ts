import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SupportTicketComponent } from '../support-ticket/support-ticket.component';
import { User } from '@auth0/auth0-angular';
import { UserProfile } from '../../../core/models/user/user-profile';

@Component({
    selector: 'sr-chat-ticket-card',
    standalone: true,
    imports: [CommonModule, MatIcon, Button, DialogModule, TranslateModule, SupportTicketComponent],
    templateUrl: './chat-ticket-card.component.html',
    styleUrl: './chat-ticket-card.component.scss',
})
export class ChatTicketCardComponent {
    @Input() me?: User | null;

    @Input() userProfile?: UserProfile;

    @Input() conversationId?: string | null;

    @Input() submited: boolean = false;

    submitDialog: boolean = false;
    showTicketDialog(bool: boolean) {
        this.submitDialog = bool;
    }
}
