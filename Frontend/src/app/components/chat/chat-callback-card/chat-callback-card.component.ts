import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ScheduleCallbackComponent } from '../schedule-callback/schedule-callback.component';
import { ChatSupportTicket } from '../../../core/models/chat/support-ticket';
import { User } from '@auth0/auth0-angular';

@Component({
    selector: 'sr-chat-callback-card',
    standalone: true,
    imports: [CommonModule, MatIcon, Button, DialogModule, TranslateModule, ScheduleCallbackComponent],
    templateUrl: './chat-callback-card.component.html',
    styleUrl: './chat-callback-card.component.scss',
})
export class ChatCallBackCardComponent {
    @Input() me?: User | null;

    @Input() scheduledDate?: Date;

    @Input() submited: boolean = false;

    @Input() conversationId?: string | null;

    @Input() supportTicket?: ChatSupportTicket | null;

    scheduleDialog: boolean = false;

    showScheduleDialog(value: boolean) {
        this.scheduleDialog = value;
    }
}
