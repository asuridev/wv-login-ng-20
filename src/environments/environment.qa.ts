import { RedirectClientIds } from './keycloak-config-model';

export const environment = {
  production: false,
  staging: true,
  environmentName: 'qa',

  apiConfig: {
    baseUrl: 'https://api-services-uat.cardifnet.com/CO/UAT',
    timeout: 30000,
    enableLogging: true,
  },

  features: {
    analytics: false,
    errorReporting: true,
    debugMode: true,
    mockData: false,
    hotReload: false,
  },

  projectConfig: {
    defaultProject: 'cardif-banco-occidente',
    allowProjectSwitching: true,
  },

  logging: {
    level: 'info',
    enableConsole: true,
    enableRemote: false,
  },

  urls: {
    assets: '/assets',
    documentation: 'https://webview-uat.cardif.com.co/docs',
    ip: 'https://api.ipify.org?format=json',
    persistenteApi: 'https://api-services-uat.cardifnet.com/co/management/v1/sale_completed',
  },
  keycloak: {
    issuer: 'https://sso-lam-assurance.staging.echonet/auth',
    realm: 'sales-advisors-co',
    clientId: 'webviewlogin',
    // TODO: sustituir `commercial` por el client comercial real de este entorno.
    // Mientras tanto usa el mismo que `sales`, así que el comportamiento no cambia.
    redirectClientIds: {
      sales: 'webtransversal',
      commercial: 'webtransversal',
    } satisfies RedirectClientIds,
  },
  webViewBaseUrl: 'https://webview-uat.cardif.com.co',
  mastipsBaseUrl: 'https://app.mastips.cl/',
  apiBaseUrl: 'https://api-services-uat.cardifnet.com',
};
