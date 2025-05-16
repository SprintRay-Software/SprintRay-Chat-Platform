import { Component, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChatMessageService } from '../../core/services';
import { ChatWrapperComponent } from '../../components/chat';
import { MessageUserService } from '../../core/services/message-user.service';
import {
    combineLatest,
    distinctUntilChanged,
    filter,
    first,
    firstValueFrom,
    map,
    Subject,
    switchMap,
    takeUntil,
} from 'rxjs';
import { ChatSessionStatus, MessageUser } from '../../core/models';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuid } from 'uuid';
import { MatIcon } from '@angular/material/icon';
import { SpinnerComponent } from '../../components/common/spinner';
import { environment } from '../../../environments';
import { AuthService } from '@auth0/auth0-angular';

@Component({
    selector: 'sr-chat-page',
    standalone: true,
    imports: [AsyncPipe, JsonPipe, ChatWrapperComponent, MatIcon, SpinnerComponent],
    templateUrl: './chat-page.component.html',
    styleUrl: './chat-page.component.scss',
})
export class ChatPageComponent implements OnInit, OnDestroy {
    readonly user$ = this._authService.user$;
    readonly messages$ = this._messageService.messagesToDisplay$;
    readonly messagesTicket$ = this._messageService.messagesTicket$;
    readonly messageUsers$ = this.messages$.pipe(
        switchMap(messages =>
            this._messageUserService.fetchMessageUsers(messages.map(m => m.sender).filter((id): id is string => !!id))
        ),
        map(items =>
            items.reduce<Record<string, MessageUser>>(
                (p, c) => ({
                    ...p,
                    [c.id]: {
                        ...c,
                        username:
                            c.id === environment.aiBotMetadata.userId ? environment.aiBotMetadata.name : c.username,
                    },
                }),
                {}
            )
        )
    );
    readonly conversationId$ = this._messageService.conversationId$;
    readonly disable$ = this._messageService.conversationState$.pipe(
        map(s => s.isWaitingAiResponse || s.isCreatingMessage || s.initializing)
    );
    readonly isCreatingMessage$ = this._messageService.conversationState$.pipe(map(x => x.isCreatingMessage));
    readonly isWaitingAiResponse$ = this._messageService.conversationState$.pipe(map(x => x.isWaitingAiResponse));
    readonly chatSessionStatus$ = this._messageService.chatSessionStatus$;
    readonly isInitializing$ = this._messageService.initializing$;

    private readonly _destroy$ = new Subject<void>();
    private readonly _initializedConversation = new Set<string>();

    constructor(
        private readonly _authService: AuthService,
        private readonly _messageService: ChatMessageService,
        private readonly _messageUserService: MessageUserService,
        private readonly _activeRoute: ActivatedRoute,
        private readonly _router: Router
    ) {}

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();

        this._initializedConversation.clear();
    }

    ngOnInit() {
        this._activeRoute.queryParams
            .pipe(
                map((x, idx) => [x['conversation'], idx] as const),
                distinctUntilChanged(),
                takeUntil(this._destroy$)
            )
            .subscribe(async ([conversation, idx]) => {
                let needReroute = false;
                let needCloseSession = false;
                if (!conversation) {
                    conversation = uuid();
                    needReroute = true;
                } else {
                    needCloseSession = true;
                }

                if (!this._initializedConversation.has(conversation)) {
                    await this.initAiSession(conversation, needReroute, needReroute).catch(console.warn);
                    this._initializedConversation.add(conversation);
                }

                if (needCloseSession && idx < 1) {
                    await firstValueFrom(this._messageService.closeSession()).catch(console.warn);
                }
            });
    }

    private async initAiSession(conversation: string, initAi: boolean, needReroute = false) {
        await firstValueFrom(
            combineLatest([this._messageService.messages$, this.user$.pipe(filter(u => !!u?.sub))]).pipe(
                first(),
                switchMap(([messages, user]) =>
                    this._messageService
                        .initConversation(conversation, {
                            initAiSession: initAi,
                            sender: user!.sub!,
                        })
                        .pipe(first())
                )
            )
        );
        if (needReroute) this._router.navigate([], { queryParams: { conversation } }).catch(console.warn);
    }

    protected readonly ChatSessionStatus = ChatSessionStatus;
}
