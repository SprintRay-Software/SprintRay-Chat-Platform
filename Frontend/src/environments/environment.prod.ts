import { Environment } from './environment';

export const environment: Environment = {
    auth: {
        domain: 'auth.sprintray.com',
        clientId: 'iGan2Wc3408vXGgp4mEbNAgXRtSpHBpO',
        audience: 'http://sprintray.us',
        scope: 'openid profile email offline_access',
        responseType: 'token id_token',
    },
    apis: {
        dashboard: {
            baseUrl: 'https://dashboard.sprintray.com',
            basePath: '/api',
        },
    },
    appSyncRegion: 'us-west-2',
    appSyncGraphQLEndpoint: 'https://uas6loqlfbgjtdizihuiebbyou.appsync-api.us-west-2.amazonaws.com/graphql',
    dashboardLink: 'https://dashboard.sprintray.com',
    aiBotMetadata: {
        userId: 'auth0|66da3030df0c92b8fe931f46',
        avatarUrl: '/assets/images/ai-bot-avatar.svg',
        name: 'AI Assistant',
    },
};
