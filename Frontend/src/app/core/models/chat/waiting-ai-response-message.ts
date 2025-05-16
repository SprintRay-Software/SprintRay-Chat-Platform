import { Message, MessageType } from './message';
import { v4 as uuid } from 'uuid';
import { environment } from '../../../../environments';

export const waitingAiResponseMessage = (conversation?: string): Message =>
    Object.freeze<Message>({
        content: '',
        conversationId: conversation ?? uuid(),
        createdAt: new Date().toISOString(),
        hasFiles: false,
        id: uuid(),
        isSent: true,
        messageType: MessageType.Standard,
        sender: environment.aiBotMetadata.userId,
    });
