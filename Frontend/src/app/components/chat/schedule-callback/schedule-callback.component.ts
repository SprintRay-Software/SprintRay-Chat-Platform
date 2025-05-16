import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ChatSupportTicket } from '../../../core/models/chat/support-ticket';
import { firstValueFrom } from 'rxjs';
import { ChatBotActions, MessageType } from '../../../core/models';
import { User } from '@auth0/auth0-angular';
import { ChatMessageService } from '../../../core/services';

@Component({
    selector: 'sr-schedule-callback',
    standalone: true,
    imports: [CommonModule, TranslateModule, MatIcon],
    templateUrl: './schedule-callback.component.html',
    styleUrl: './schedule-callback.component.scss',
})
export class ScheduleCallbackComponent {
    @Input() me?: User | null;

    @Input() conversationId?: string | null;

    @Input() supportTicket?: ChatSupportTicket | null;

    @Output() closeScheduleEvent: EventEmitter<boolean> = new EventEmitter();

    callbackUrl: SafeResourceUrl = '';

    private readonly _messageService = inject(ChatMessageService);

    constructor(private sanitizer: DomSanitizer) {}

    ngOnInit() {
        this.setupIframeListeners();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['supportTicket'] && this.supportTicket) {
            const {
                firstName,
                lastName,
                phoneNumber,
                emailAddress,
                issueDescription,
                serialNumber,
                raywareType,
                resinType,
                existingTicket,
            } = this.supportTicket;
            const url = `https://sprintray.na.chilipiper.com/book/technical-callback?firstname=${firstName}&lastname=${lastName}&phone=${phoneNumber}&email=${emailAddress}&caseid=${this.conversationId}&assistance=${issueDescription}&serialnumber=${serialNumber}&resin=${resinType}&raywaretype=${raywareType}&casenumber=${existingTicket}`;
            this.callbackUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
    }

    setupIframeListeners() {
        window.addEventListener('message', this.handleMessage.bind(this));
    }

    handleMessage(event: MessageEvent) {
        const { action, args } = event.data;
        if (action === 'booking-confirmed') {
            this.createMessage(args?.slot.start);
        }
    }
    cancel() {
        this.closeScheduleEvent.emit(false);
    }

    protected async createMessage(scheduleTime: string) {
        if (this.me?.sub && this.conversationId && scheduleTime) {
            await firstValueFrom(
                this._messageService.createMessageToAiChatBot(
                    this.me.sub,
                    this.conversationId,
                    scheduleTime,
                    MessageType.Standard,
                    ChatBotActions.submitScheduleCallback
                )
            ).catch(console.log);
        }
    }
}
