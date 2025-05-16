import gql from 'graphql-tag';

export default gql`
    query getConversationMessages($conversationId: ID!, $after: String, $first: Int) {
        allMessageConnection(conversationId: $conversationId, after: $after, first: $first) {
            __typename
            nextToken
            messages {
                __typename
                id
                conversationId
                content
                createdAt
                sender
                isSent
                hasFiles
                messageType
                metadata {
                    __typename
                    ai {
                        __typename
                        chatId
                        action
                        humanNeeded
                        status
                        options {
                            setup_confirm
                            category
                            product
                            __typename
                        }
                        references {
                            __typename
                            title
                            link
                            type
                            file {
                                __typename
                                name
                                size
                                downloadLink
                            }
                        }
                        error {
                            __typename
                            type
                            message
                        }
                    }
                    supportTicket {
                        __typename
                        firstName
                        lastName
                        company
                        emailAddress
                        phoneNumber
                        countryCode
                        country
                        issueDescription
                        serialNumber
                        raywareType
                        resinType
                        existingTicket
                    }
                    supportTicketResult {
                        __typename
                        status
                        message
                    }
                }
            }
        }
    }
`;
