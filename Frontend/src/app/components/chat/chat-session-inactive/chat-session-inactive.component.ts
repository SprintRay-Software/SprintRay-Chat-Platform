import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'sr-chat-session-inactive',
    standalone: true,
    imports: [CommonModule, Button, TranslateModule, MatIcon],
    template: `
        <div class="chat-session-inactive__container d-flex align-items-center justify-content-center">
            <div class="chat-session-inactive__body-container" style="gap: 20px">
                <div>
                    <p class="m-0">{{ 'messages.chatSessionEnded' | translate }}</p>
                </div>
                <div>
                    <p-button
                        [outlined]="true"
                        [rounded]="true"
                        styleClass="p-button-outline-white"
                        (onClick)="startNewChat.emit()"
                    >
                        <span>{{ 'general.startNewChat' | translate }}</span>
                        <span>
                            <mat-icon svgIcon="sr:add" />
                        </span>
                    </p-button>
                </div>
            </div>
        </div>
    `,
    styleUrl: './chat-session-inactive.component.scss',
})
export class ChatSessionInactiveComponent {
    @Output() readonly startNewChat = new EventEmitter<void>();
}
