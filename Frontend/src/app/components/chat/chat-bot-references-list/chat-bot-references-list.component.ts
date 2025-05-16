import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChatBotReferences } from '../../../core/models';
import { CommonModule } from '@angular/common';
import { ChatBotReferenceComponent } from '../chat-bot-reference';

@Component({
    selector: 'sr-chat-bot-references-list',
    standalone: true,
    imports: [TranslateModule, CommonModule, ChatBotReferenceComponent],
    template: `
        <div class="chat-references-list__container">
            <div class="chat-references-list__title-container">
                <span>{{ 'general.references' | translate }}</span>
            </div>

            <div *ngFor="let item of data" class="chat-references-list__item-container">
                <sr-chat-bot-reference [data]="item" />
            </div>
        </div>
    `,
    styleUrl: './chat-bot-references-list.component.scss',
})
export class ChatBotReferencesListComponent {
    @Input() data?: ChatBotReferences | null;
}
