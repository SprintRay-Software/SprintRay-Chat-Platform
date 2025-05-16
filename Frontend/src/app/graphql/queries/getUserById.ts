import gql from 'graphql-tag';

export default gql`
    query getUserById($cognitoId: ID!) {
        getUser(cognitoId: $cognitoId) {
            id
            username
            cognitoId
        }
    }
`;
