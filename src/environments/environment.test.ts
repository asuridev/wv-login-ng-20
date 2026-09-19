import { RedirectClientIds } from './keycloak-config-model';

export const environment = {
  production: false,
  staging: false,
  environmentName: 'test',

  apiConfig: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 30000,
    enableLogging: false,
  },

  features: {
    analytics: false,
    errorReporting: false,
    debugMode: true,
    mockData: true,
    hotReload: false,
  },

  projectConfig: {
    defaultProject: 'cardif-banco-occidente',
    allowProjectSwitching: true,
  },

  logging: {
    level: 'debug',
    enableConsole: false,
    enableRemote: false,
  },

  urls: {
    assets: '/assets',
    documentation: 'http://localhost:4200/docs',
    ip: 'https://api.ipify.org?format=json',
    persistenteApi: 'https://api-services-uat.cardifnet.com/co/management/v1/sale_completed',
  },
  keycloak: {
    issuer: 'http://localhost:8080/auth',
    realm: 'sales-advisors.co',
    clientId: 'webviewlogin',
    // TODO: sustituir `commercial` por el client comercial real de este entorno.
    // Mientras tanto usa el mismo que `sales`, así que el comportamiento no cambia.
    redirectClientIds: {
      sales: 'webtransversal',
      commercial: 'webtransversal',
    } satisfies RedirectClientIds,
  },
  webViewBaseUrl: 'https://webview-dev.cardif.com.co',
  mastipsBaseUrl: 'https://app.mastips.cl/',
  apiBaseUrl: 'http://localhost:3000',
};
