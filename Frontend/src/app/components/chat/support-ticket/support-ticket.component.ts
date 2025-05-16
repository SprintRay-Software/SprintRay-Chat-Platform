import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ChatMessageService } from '../../../core/services';
import { firstValueFrom } from 'rxjs';
import { User } from '@auth0/auth0-angular';
import { ChatSupportTicket } from '../../../core/models/chat/support-ticket';
import { ChatBotActions, MessageMetadataInput, MessageType } from '../../../core/models';
import { CountryList } from '../../../core/constants/countries';
import { ClaimKeys } from '../../../core/constants/claim-keys';
import { UserProfile } from '../../../core/models/user/user-profile';

@Component({
    selector: 'sr-submit-ticket',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextareaModule,
        MatIcon,
        Button,
        TooltipModule,
        TranslateModule,
        InputTextModule,
        InputMaskModule,
        DropdownModule,
        FloatLabelModule,
        MatSelectModule,
        MatInputModule,
        MatFormFieldModule,
    ],
    templateUrl: './support-ticket.component.html',
    styleUrl: './support-ticket.component.scss',
})
export class SupportTicketComponent {
    @Input() me?: User | null;

    @Input() userProfile?: UserProfile;

    @Input() conversationId?: string | null;

    @Output() closeTicketEvent: EventEmitter<boolean> = new EventEmitter();

    countryList = CountryList;

    countryFlag: string = '';

    ticketForm: FormGroup = this.fb.group({
        firstName: ['', [Validators.required, Validators.maxLength(500)]],
        lastName: ['', [Validators.required, Validators.maxLength(500)]],
        company: ['', [Validators.required, Validators.maxLength(500)]],
        emailAddress: ['', [Validators.required, Validators.email, Validators.maxLength(500)]],
        countryCode: ['', [Validators.required, Validators.maxLength(500)]],
        phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
        country: ['', [Validators.required, Validators.maxLength(50)]],
        issueDescription: ['', [Validators.required, Validators.maxLength(500)]],
        serialNumber: [''],
        raywareType: [''],
        resinType: [''],
        existingTicket: [''],
    });

    private readonly _messageService = inject(ChatMessageService);

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
        this.ticketForm.get('countryCode')?.valueChanges.subscribe(value => {
            this.setCountryFlag(value.countryFlag);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['userProfile'] && this.userProfile) {
            const { personalInfo, businessInfo } = this.userProfile;
            if (personalInfo) {
                this.ticketForm.patchValue({
                    firstName: personalInfo.firstName,
                    lastName: personalInfo.lastName,
                    emailAddress: personalInfo.email,
                });
            }
            if (businessInfo) {
                const country = this.countryList.find(c => c.id === businessInfo.countryId);
                this.ticketForm.patchValue({
                    company: businessInfo.businessName,
                    country: country?.countryName === businessInfo.countryName ? country.countryName : null,
                    countryCode: country,
                    phoneNumber: businessInfo.phoneNumber,
                });
                if (country) {
                    this.setCountryFlag(country.countryFlag);
                }
            }
        }
    }

    submit() {
        if (this.ticketForm.valid) {
            const countryCode = this.ticketForm.get('countryCode')?.value.phoneCode;
            const supportTicket: ChatSupportTicket = {
                ...this.ticketForm.value,
                countryCode,
                region: this.me ? this.me[ClaimKeys.app_metadata]?.region : null,
            };
            this.createMessage(supportTicket).then(() => {
                this.cancel();
            });
        }
    }

    cancel() {
        this.closeTicketEvent.emit(false);
    }

    private setCountryFlag(countryFlag: string) {
        this.countryFlag = `assets/images/country-flags/${countryFlag}.svg`;
    }

    protected async createMessage(supportTicket: ChatSupportTicket) {
        if (this.me?.sub && this.conversationId && supportTicket) {
            const metadata: MessageMetadataInput = { supportTicket };
            await firstValueFrom(
                this._messageService.createMessageToAiChatBot(
                    this.me.sub,
                    this.conversationId,
                    '',
                    MessageType.Standard,
                    ChatBotActions.submitSupportTicket,
                    metadata
                )
            ).catch(() => {});
        }
    }
}
