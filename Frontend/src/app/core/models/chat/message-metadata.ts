import { ChatSupportTicket } from './support-ticket';

export enum ChatBotActions {
    initialize = 'initialize_session',
    selectCategory = 'select_category',
    selectProduct = 'select_product',
    selectSetupConfirm = 'select_setup_confirm',
    askQuestion = 'ask_question',
    submitSupportTicket = 'submit_support_ticket',
    submitScheduleCallback = 'submit_schedule_callback',
    closeSession = 'close_session',
}

export interface ChatBotOptions {
    category: string[];
    product: string[];
    setup_confirm: string[];
}

export interface ChatBotReference {
    title?: string | null;
    link?: string | null;
    type: ChatBotReferenceType;
    file?: {
        name: string;
        size: number;
        downloadLink: string;
    };
}

export enum ChatBotReferenceType {
    link = 'link',
    file = 'file',
}

export interface ChatBotMessageMetadata {
    action: ChatBotActions | '';
    chatId: string;
    status: string;
    options: ChatBotOptions;
    isSentFromUser: boolean;
    humanNeeded: boolean;
    references?: ChatBotReferences | null;
    error?: ChatBotError | null;
}

export type ChatBotReferences = ChatBotReference[];

export interface ChatBotError {
    type: string;
    message: string;
}

export interface MessageMetadata {
    ai: ChatBotMessageMetadata;
    supportTicket?: ChatSupportTicket;
}

export interface MessageMetadataInput {
    ai?: Omit<Partial<ChatBotMessageMetadata>, 'options'> & {
        options: Partial<ChatBotMessageMetadata['options']>;
    };
    supportTicket?: ChatSupportTicket;
}
