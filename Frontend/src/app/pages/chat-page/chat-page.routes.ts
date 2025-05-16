import { Routes } from '@angular/router';
import { ChatPageComponent } from './chat-page.component';
import { ChatMessageService } from '../../core/services';

export const ChatPageRoutes: Routes = [
    {
        path: '',
        component: ChatPageComponent,
        providers: [ChatMessageService],
    },
];
