import { Messages, MessageType } from '../models/chat/message';

export const MockMessages: Readonly<Messages> = Object.freeze([
    {
        content: 'Test, This is a test message',
        sender: 'auth0|6667d9b4069168aa666d679c',
        messageType: MessageType.Standard,
        isSent: true,
        hasFiles: false,
        id: 'C6C2A634-7760-4424-A87A-F376DBFFDA6B',
        conversationId: 'CD236987-045B-4869-8C18-5BA9D8F432F6',
        createdAt: '2024-08-01T14:00:00',
    },
    {
        content: 'Test2222, A test message',
        sender: 'auth0|64c74cd2aa8be58a80790c5e',
        messageType: MessageType.Standard,
        isSent: true,
        hasFiles: false,
        id: 'F1050FE1-1886-478D-AE80-BF86FADEC926',
        conversationId: 'CD236987-045B-4869-8C18-5BA9D8F432F6',
        createdAt: '2024-08-01T14:01:00Z',
    },
    {
        content: 'Test2222, A test message',
        sender: 'auth0|64895ab6b804ef725c237f4b',
        messageType: MessageType.Standard,
        isSent: true,
        hasFiles: false,
        id: '5908AE12-410F-49E5-9354-67CCADE885E7',
        conversationId: 'CD236987-045B-4869-8C18-5BA9D8F432F6',
        createdAt: '2024-08-01T16:01:00.000Z',
    },
    {
        content: `long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, High quality
Internationalized and accessible components for everyone. Well tested to ensure performance and reliability.

Straightforward APIs with consistent cross platform behaviour.long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, High quality
Internationalized and accessible components for everyone. Well tested to ensure performance and reliability.

Straightforward APIs with consistent cross platform behaviour.long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, High quality
Internationalized and accessible components for everyone. Well tested to ensure performance and reliability.

Straightforward APIs with consistent cross platform behaviour.long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, High quality
Internationalized and accessible components for everyone. Well tested to ensure performance and reliability.

Straightforward APIs with consistent cross platform behaviour.long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, long text test, High quality
Internationalized and accessible components for everyone. Well tested to ensure performance and reliability.

Straightforward APIs with consistent cross platform behaviour.`,
        sender: 'auth0|64895ab6b804ef725c237f4b',
        messageType: MessageType.Standard,
        isSent: true,
        hasFiles: false,
        id: 'B849F792-2703-448B-8DF1-BA50EB1E082B',
        conversationId: 'CD236987-045B-4869-8C18-5BA9D8F432F6',
        createdAt: '2024-08-01T16:07:00.801Z',
    },
]);
