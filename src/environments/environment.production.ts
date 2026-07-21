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
  cards: {
    urlRedirect: {
      protection: 'https://webview.cardif.com.co',
      modular: 'https://webview.cardif.com.co',
      progress: 'https://webview.cardif.com.co',
      medical: 'https://webview.cardif.com.co',
    },
  },
  keycloak: {
    issuer: 'https://sso-lam-assurance.echonet/auth',
    realm: 'sales-advisors.co',
    clientId: 'webviewlogin',
    redirectClintId: 'webtransversal',
  },
  webViewBaseUrl: 'https://webview.cardif.com.co',
  mastipsBaseUrl: 'https://app.mastips.cl/',
  apiBaseUrl: 'https://api-services.cardifnet.com',
};
