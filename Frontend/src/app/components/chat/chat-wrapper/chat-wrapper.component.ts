import {
    AfterViewInit,
    Component,
    ElementRef,
    inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChange,
    ViewChild,
} from '@angular/core';
import { ChatMessageComponent } from '../chat-message';
import { CommonModule } from '@angular/common';
import { User } from '@auth0/auth0-angular';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Button } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { ChatBotActions, Message, MessageUser, Messages } from '../../../core/models';
import { FormsModule } from '@angular/forms';
import { ChatMessageService } from '../../../core/services';
import {
    combineLatest,
    debounceTime,
    distinctUntilChanged,
    filter,
    first,
    firstValueFrom,
    Observable,
    ReplaySubject,
    Subject,
    takeUntil,
    throttleTime,
} from 'rxjs';
import { last } from 'lodash-es';
import { ChatLandComponent } from '../chat-land';
import { SpinnerComponent } from '../../common/spinner';
import { waitingAiResponseMessage } from '../../../core/models/chat/waiting-ai-response-message';
import { environment } from '../../../../environments';
import { ChatTicketCardComponent } from '../chat-ticket-card/chat-ticket-card.component';
import { ChatCallBackCardComponent } from '../chat-callback-card/chat-callback-card.component';
import { ChatSessionInactiveComponent } from '../chat-session-inactive/chat-session-inactive.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatSupportTicket } from '../../../core/models/chat/support-ticket';
import { UserService } from '../../../core/services/user.service';
import { USA, Canada } from '../../../core/constants/countries';
import { UserProfile } from '../../../core/models/user/user-profile';

const callbackCountryIds = [USA.id, Canada.id];

@Component({
    selector: 'sr-chat-wrapper',
    standalone: true,
    imports: [
        CommonModule,
        ChatMessageComponent,
        ChatTicketCardComponent,
        ChatCallBackCardComponent,
        InputTextareaModule,
        Button,
        TranslateModule,
        MatIcon,
        FormsModule,
        ChatLandComponent,
        SpinnerComponent,
        ChatSessionInactiveComponent,
    ],
    templateUrl: './chat-wrapper.component.html',
    styleUrl: './chat-wrapper.component.scss',
})
export class ChatWrapperComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    @ViewChild('messagesContainerEl') messagesContainerEl?: ElementRef<HTMLDivElement>;
    @ViewChild('messageInputBox', { static: false }) messageInputBox?: ElementRef<HTMLTextAreaElement>;

    @Input() messages?: Readonly<Messages> | null;
    @Input() messagesTicket?: Readonly<Messages> | null;
    @Input() messageUsers?: Record<string, MessageUser> | null;
    @Input() me?: User | null;
    @Input() conversationId?: string | null;
    @Input() isLoading = false;
    @Input() disableMessageInput = false;
    @Input() disableSendButton = false;
    @Input() isCreatingMessage = false;
    @Input() isWaitingAiResponse = false;
    @Input() chatSessionEnded?: boolean = false;

    messageContent?: string | null;

    userProfile?: UserProfile;

    showSupportTicket: boolean = false;

    supportTicketSubmited: boolean = false;

    supportTicketData?: ChatSupportTicket;

    showScheduleCallback: boolean = false;

    scheduleCallbackSubmited: boolean = false;

    scheduleCallbackDate?: Date;

    protected readonly aiBotMetadata = environment.aiBotMetadata;

    protected waitingAiResponseMessage = waitingAiResponseMessage();

    private readonly _userService = inject(UserService);
    private readonly _messageService = inject(ChatMessageService);
    private readonly _messagesChanged$ = new ReplaySubject<Readonly<Messages>>(1);
    private readonly _destroyed$ = new Subject<void>();

    private _lastMessageScrolledTo?: string | null;
    private _messagesContainerScrollHeight = 0;
    private _userCountryId: number = 0;

    constructor(
        private readonly _router: Router,
        private readonly _activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this._userService
            .getUserProfile()
            .pipe(first())
            .subscribe(profile => {
                this.userProfile = profile;
                this._userCountryId = profile.businessInfo.countryId;
            });
    }

    ngOnChanges(changes: Record<keyof ChatWrapperComponent, SimpleChange>) {
        if (changes.messages && this.messages) {
            this._messagesChanged$.next(this.messages);
        }

        if (changes.messagesTicket && this.messagesTicket) {
            this.showTicket(this.messagesTicket);
        }

        if (changes.conversationId && this.conversationId) {
            this.waitingAiResponseMessage = waitingAiResponseMessage(this.conversationId);
        }

        if (
            changes.disableMessageInput &&
            !this.chatSessionEnded &&
            changes.disableMessageInput.previousValue === true &&
            !this.disableMessageInput
        ) {
            setTimeout(() => {});
            Promise.resolve().then(() => this.messageInputBox?.nativeElement.focus({}));
        }
    }

    ngAfterViewInit() {
        const mutationObservable = new Observable<MutationRecord[]>(subscriber => {
            const mutationObserver = new MutationObserver(e => {
                subscriber.next(e);
            });
            mutationObserver.observe(this.messagesContainerEl?.nativeElement!, {
                subtree: true,
                attributes: true,
                childList: true,
            });

            return {
                unsubscribe() {
                    mutationObserver.disconnect();
                },
            };
        });

        combineLatest([
            mutationObservable.pipe(throttleTime(300)),
            this._messagesChanged$.pipe(
                filter(x => x?.length > 0),
                distinctUntilChanged((x, y) => x?.length === y?.length)
            ),
        ])
            .pipe(debounceTime(500), takeUntil(this._destroyed$))
            .subscribe(([, messages]) => {
                const el = this.messagesContainerEl?.nativeElement;
                const lastMessage = last(messages);

                if (this._lastMessageScrolledTo === lastMessage?.id) return;

                if (el) {
                    if (lastMessage && el.querySelector(`#message-item__${lastMessage.id}`)) {
                        this._lastMessageScrolledTo = lastMessage.id;
                    }

                    el.scrollTo(0, el.scrollHeight);
                    this.messageInputBox?.nativeElement.focus({});
                }

                this._messagesContainerScrollHeight = el?.scrollHeight ?? 0;
            });
    }

    ngOnDestroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    protected async onResubmitLastMessage(targetMessage: Message) {
        const { messages, me } = this;
        if (messages && me) {
            const targetIndex = messages.findIndex(m => m.id === targetMessage.id);
            if (targetIndex >= 0) {
                const previousMessage = messages[targetIndex - 1];
                if (previousMessage && previousMessage.sender === me.sub) {
                    this.messageContent = decodeURI(previousMessage.content);
                    await this.createMessage();
                }
            }
        }
    }

    private showTicket(messages: readonly Message[]) {
        const showTicket = messages.find(message => message?.metadata?.ai.humanNeeded);
        if (showTicket) {
            this.showSupportTicket = !!showTicket;

            const submitSupportTicket = messages.find(
                message => message?.metadata?.ai.action === ChatBotActions.submitSupportTicket
            );

            this.supportTicketSubmited = !!submitSupportTicket;

            if (this.supportTicketSubmited && callbackCountryIds.includes(this._userCountryId)) {
                this.showScheduleCallback = true;
                this.supportTicketData = submitSupportTicket?.metadata?.supportTicket;

                const submitScheduleCallback = messages.find(
                    message => message?.metadata?.ai.action === ChatBotActions.submitScheduleCallback
                );
                if (submitScheduleCallback) {
                    this.scheduleCallbackSubmited = true;
                    this.scheduleCallbackDate = new Date(+submitScheduleCallback?.content);
                }
            }
        } else {
            this.showSupportTicket = false;
            this.supportTicketSubmited = false;
            this.showScheduleCallback = false;
            this.scheduleCallbackSubmited = false;
        }
    }

    protected startNewChat() {
        return this._router.navigate([], {
            relativeTo: this._activatedRoute,
            queryParams: {
                conversation: null,
            },
            queryParamsHandling: 'merge',
        });
    }

    protected async createMessage() {
        const { messageContent } = this;
        if (
            messageContent &&
            this.me?.sub &&
            this.conversationId &&
            !this.isCreatingMessage &&
            !this.disableMessageInput &&
            !this.disableSendButton
        ) {
            this.messageContent = undefined;
            await firstValueFrom(
                this._messageService.createMessageToAiChatBot(this.me.sub, this.conversationId, messageContent)
            ).catch(() => {
                this.messageContent = messageContent;
            });
        }
    }
}
