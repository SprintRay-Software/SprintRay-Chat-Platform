import { MessageMetadata } from '../core/models';

export type getUserQuery = {
    // Scan through all values of type 'User'. Use the 'after' and 'before' arguments with the 'nextToken' returned by the 'UserConnection' result to fetch pages.
    getUser: {
        __typename: 'User';
        // Generated id for a user. read-only
        id: string;
        // A unique identifier for the user.
        cognitoId: string;
        // The username
        username: string;
        // registered?
        registered: boolean;
    };
};

export type getConversationMessagesQuery = {
    // Scan through all values of type 'MessageConnection'. Use the 'after' and 'before' arguments with the 'nextToken' returned by the 'MessageConnectionConnection' result to fetch pages.
    allMessageConnection: {
        __typename: 'MessageConnection';
        nextToken: string | null;
        messages: Array<{
            __typename: 'Message';
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
            //
            messageType: number | null;
            metadata:
                | (MessageMetadata & {
                      __typename: 'MessageMetadata';
                      ai: MessageMetadata['ai'] & {
                          __typename: 'Chatbot';
                      };
                  })
                | null;
        } | null> | null;
    } | null;
    subscribeToNewMessage?: {
        __typename: 'Message';
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
        //
        messageType: number | null;
        metadata:
            | (MessageMetadata & {
                  __typename: 'MessageMetadata';
                  ai: MessageMetadata['ai'] & {
                      __typename: 'ChatBot';
                  };
              })
            | null;
    } | null;
};
