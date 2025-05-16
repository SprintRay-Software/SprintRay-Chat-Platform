export interface Environment {
    auth: {
        domain: string;
        clientId: string;
        audience: string;
        scope: string;
        responseType: string;
    };
    apis: {
        dashboard: {
            baseUrl: string;
            basePath: string;
        };
    };
    appSyncRegion: string;
    appSyncGraphQLEndpoint: string;
    dashboardLink: string;
    aiBotMetadata: {
        userId: string;
        avatarUrl: string;
        name: string;
    };
}
