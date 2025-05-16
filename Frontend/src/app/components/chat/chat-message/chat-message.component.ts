import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange } from '@angular/core';
import { ChatBotError, Message } from '../../../core/models';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import {
    DecodeURIPipe,
    ExtractAnchorElementsPipe,
    InitialsPipe,
    MessageDatePipe,
    MessageUserAvatarPipe,
} from '../../../core/pipes';
import { MessageUser } from '../../../core/models';
import { SafePipe } from 'safe-pipe';
import { SpinnerComponent } from '../../common/spinner';
import { ChatBotReferencesListComponent } from '../chat-bot-references-list';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'sr-chat-message',
    standalone: true,
    imports: [
        AvatarModule,
        CommonModule,
        DecodeURIPipe,
        MessageDatePipe,
        ExtractAnchorElementsPipe,
        SafePipe,
        MessageUserAvatarPipe,
        InitialsPipe,
        SpinnerComponent,
        ChatBotReferencesListComponent,
        Button,
        TranslateModule,
        MatIcon,
    ],
    templateUrl: './chat-message.component.html',
    styleUrl: './chat-message.component.scss',
})
export class ChatMessageComponent implements OnChanges {
    @Input() message?: Message | null;
    @Input() isMe?: boolean | null = false;
    @Input() messageUser?: MessageUser | null;
    @Input() showLoading?: boolean | null = false;
    @Input() isAiBot?: boolean | null = false;
    @Input() disableResubmitLastMessage?: boolean | null = false;

    @Output() readonly resubmitLastMessage = new EventEmitter<Message>();

    protected error?: ChatBotError | null;
    protected readonly errorContent = this.translateService.instant('messages.aiBotError');

    constructor(private readonly translateService: TranslateService) {}

    ngOnChanges(changes: Record<keyof ChatMessageComponent, SimpleChange>) {
        if (changes.message && this.message && this.message.metadata) {
            this.error = this.message.metadata.ai.error;
        }
    }
}
