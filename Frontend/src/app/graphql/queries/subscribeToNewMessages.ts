import gql from 'graphql-tag';

export default gql`
    subscription subscribeToNewMessage($conversationId: ID!) {
        subscribeToNewMessage(conversationId: $conversationId) {
            __typename
            conversationId
            createdAt
            id
            sender
            content
            isSent
            hasFiles
            messageType
            metadata {
                __typename
                ai {
                    __typename
                    options {
                        __typename
                        category
                        setup_confirm
                        product
                    }
                    chatId
                    humanNeeded
                    action
                    status
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
`;
