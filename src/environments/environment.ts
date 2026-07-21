export const environment = {
  production: false,
  staging: false,
  environmentName: 'development',

  apiConfig: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 30000,
    enableLogging: true,
  },

  features: {
    analytics: false,
    errorReporting: false,
    debugMode: true,
    mockData: true,
    hotReload: true,
  },

  projectConfig: {
    defaultProject: 'cardif-banco-occidente',
    allowProjectSwitching: true,
  },

  logging: {
    level: 'debug',
    enableConsole: true,
    enableRemote: false,
  },

  urls: {
    assets: '/assets',
    documentation: 'http://localhost:4200/docs',
    ip: 'https://api.ipify.org?format=json',
    persistenteApi: 'https://api-services-uat.cardifnet.com/co/management/v1/sale_completed',
  },
  cards: {
    urlRedirect: {
      protection: 'https://webview-uat.cardif.com.co',
      modular: 'https://webview-uat.cardif.com.co',
      progress: 'https://webview-uat.cardif.com.co',
      medical: 'https://webview-uat.cardif.com.co',
    },
  },
  keycloak: {
    issuer: 'https://sso-lam-assurance.staging.echonet/auth',
    realm: 'sales-advisors.co',
    clientId: 'webviewlogin',
    redirectClintId: 'webtransversal',
  },
  webViewBaseUrl: 'https://webview-dev.cardif.com.co',
  mastipsBaseUrl: 'https://app.mastips.cl/',
  apiBaseUrl: 'http://localhost:3000',
};
