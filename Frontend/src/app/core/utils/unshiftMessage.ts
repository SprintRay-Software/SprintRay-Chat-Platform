import { getConversationMessagesQuery } from '../../graphql';
import { Message } from '../models';
import { has } from 'lodash-es';
import update from 'immutability-helper';

export const unshiftMessage = (
    data: getConversationMessagesQuery,
    message: Message & { __typename?: string | null }
): getConversationMessagesQuery => {
    if (!data || !has(data, 'allMessageConnection.messages')) {
        return {
            allMessageConnection: {
                nextToken: null,
                __typename: 'MessageConnection',
                messages: [],
            },
        };
    }

    if ((data.allMessageConnection?.messages ?? []).some(m => m?.id === message.id)) {
        return data;
    }

    return update(data, {
        allMessageConnection: {
            // @ts-ignore
            messages: { $unshift: [message] },
        },
    });
};
