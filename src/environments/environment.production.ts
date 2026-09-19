import { RedirectClientIds } from './keycloak-config-model';

export const environment = {
  production: true,
  staging: false,
  environmentName: 'production',

  apiConfig: {
    baseUrl: 'https://api-services.cardifnet.com/CO/PROD',
    timeout: 30000,
    enableLogging: false,
  },

  features: {
    analytics: true,
    errorReporting: true,
    debugMode: false,
    mockData: false,
    hotReload: false,
  },

  projectConfig: {
    defaultProject: 'cardif-banco-occidente',
    allowProjectSwitching: false,
  },

  logging: {
    level: 'error',
    enableConsole: false,
    enableRemote: true,
  },

  urls: {
    assets: '/assets',
    documentation: 'https://webview.cardif.com.co/docs',
    ip: 'https://api.ipify.org?format=json',
    persistenteApi: 'https://api-services.cardifnet.com/co/management/v1/sale_completed',
  },
  keycloak: {
    issuer: 'https://sso-lam-assurance.echonet/auth',
    realm: 'sales-advisors-co',
    clientId: 'webviewlogin',
    // TODO: sustituir `commercial` por el client comercial real de este entorno.
    // Mientras tanto usa el mismo que `sales`, así que el comportamiento no cambia.
    redirectClientIds: {
      sales: 'webtransversal',
      commercial: 'webtransversal',
    } satisfies RedirectClientIds,
  },
  webViewBaseUrl: 'https://webview.cardif.com.co',
  mastipsBaseUrl: 'https://app.mastips.cl/',
  apiBaseUrl: 'https://api-services.cardifnet.com',
};
