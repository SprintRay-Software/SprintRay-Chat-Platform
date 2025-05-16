import { Environment } from './environment';

export const environment: Environment = {
    auth: {
        domain: 'dev-auth.sprintray.com',
        clientId: 'AmPh6pRJhnQFxNKLkYhVZNfAUoiP5Kha',
        audience: 'http://sprintray-dashboard-dev.us',
        scope: 'openid profile email offline_access',
        responseType: 'token id_token',
    },
    apis: {
        dashboard: {
            baseUrl: 'https://dev.designservice.sprintray.com',
            basePath: '/api',
        },
    },
    appSyncRegion: 'us-west-2',
    appSyncGraphQLEndpoint: 'https://24ebi63qizdb7nbkvwachequ7a.appsync-api.us-west-2.amazonaws.com/graphql',
    dashboardLink: 'https://dev.designservice.sprintray.com',
    aiBotMetadata: {
        userId: 'auth0|66da4dae1fa05e8589c82a01',
        avatarUrl: '/assets/images/ai-bot-avatar.svg',
        name: 'AI Assistant',
    },
};
