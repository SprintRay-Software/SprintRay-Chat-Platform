import gql from 'graphql-tag';

export default gql`
    mutation createMessage(
        $id: ID!
        $content: String
        $conversationId: ID!
        $createdAt: String!
        $hasFiles: Boolean
        $messageType: Int
        $messageMetadata: MessageMetadataInput
    ) {
        createMessage(
            id: $id
            content: $content
            conversationId: $conversationId
            createdAt: $createdAt
            hasFiles: $hasFiles
            messageType: $messageType
            messageMetadata: $messageMetadata
        ) {
            conversationId
            createdAt
            id
            sender
            content
            isSent
            hasFiles
            messageType
            __typename
            metadata {
                __typename
                ai {
                    __typename
                    humanNeeded
                    action
                    chatId
                    isSentFromUser
                    status
                    options {
                        setup_confirm
                        category
                        __typename
                        product
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
