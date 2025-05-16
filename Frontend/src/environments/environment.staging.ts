import { Environment } from './environment';

export const environment: Environment = {
    auth: {
        domain: 'staging-auth.sprintray.com',
        clientId: '0FeoGKWunRXpV4eOFAhknfq9eHrUmtUe',
        audience: 'http://sprintray-dashboard-staging.us',
        scope: 'openid profile email offline_access',
        responseType: 'token id_token',
    },
    apis: {
        dashboard: {
            baseUrl: 'https://staging.designservice.sprintray.com',
            basePath: '/api',
        },
    },
    appSyncRegion: 'us-west-2',
    appSyncGraphQLEndpoint: 'https://gy26nduma5hczonghh56xzueue.appsync-api.us-west-2.amazonaws.com/graphql',
    dashboardLink: 'https://staging.designservice.sprintray.com',
    aiBotMetadata: {
        userId: 'auth0|66da2f845eddfedf10fae727',
        avatarUrl: '/assets/images/ai-bot-avatar.svg',
        name: 'AI Assistant',
    },
};
