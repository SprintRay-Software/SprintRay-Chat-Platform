import { MessageMetadata, MessageMetadataInput } from './message-metadata';

export enum MessageType {
    Standard = 0,
    StandardWithFiles = 1,
    RequestRevision = 2,
    RequestApproval = 3,
    CancelRequestRevision = 4,
    DoctorRating = 5,
    AIProcessFailed = 6,
    RequestRefund = 7,
    RevisionFeeAssessed = 8,
    RevisionFeeApproved = 9,
    RevisionFeeRejected = 10,
    RevisionFeeAssessedWithFiles = 11,
    AIRequestRevision = 12,
}

export interface Message {
    // Generated id for a message -- read-only
    id: string;
    // The id of the Conversation this message belongs to. This is the table primary key.
    conversationId: string;
    // The message content.
    content: string;
    // The message timestamp. This is also the table sort key.
    createdAt: string | null;
    sender: string | null;
    // Flag denoting if this message has been accepted by the server or not.
    isSent: boolean | null;
    // Flag denoting if this message has files.
    hasFiles: boolean | null;
    messageType: MessageType | null;
    metadata?: MessageMetadata | null;
}

export interface MessageInput extends Omit<Message, 'metadata'> {
    messageMetadata?: MessageMetadataInput | null;
}

export type Messages = Message[];
