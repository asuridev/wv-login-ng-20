import { BankConfig } from '../../../models/partner-theme-model';

/** Assets compartidos por todos los partners (footer regulatorio y de marca). */
const SHARED_ASSETS = {
  logoCardif: '/assets/logos/seguros-alfa-logo.svg',
  logoVigilado: '/assets/logos/logo-vigilado.svg',
  logoAval: '/assets/logos/grupo-aval-logo.svg',
  favicon: '/assets/favicons/banco-occidente.ico',
  images: {
    hero: '/assets/images/banco-occidente-hero.jpg',
    background: '/assets/images/banco-occidente-bg.jpg',
    userOne: '/assets/img/usuario_one.png',
    eduDigital: '/assets/img/gastos_educacion.png',
    entreFisico: '/assets/img/Instafit-icon.png',
    declaRenta: '/assets/img/eco_declaracion_renta.png',
    iconEdit: '/assets/img/icon/Edit.png',
    iconDelete: '/assets/img/icon/Eliminar.png',
    armarSeguro: '/assets/img/armarSeguro.png',
    crearOferta: '/assets/img/crearOferta.png',
  },
} as const;

/** `endpointConfig` es idéntico en los cuatro partners del proyecto original. */
const SHARED_ENDPOINT_CONFIG = {
  '/jwt': { enabled: true, authRequired: true },
  '/jwe': { enabled: true, authRequired: true },
  '/customer/v1/internal/contact_info': { enabled: false },
  // (sic: "extenal" en el backend original)
  '/customer/v1/extenal/contact_info': { enabled: false },
  '/digital_sales/v1/contactData': { enabled: false },
} as const;

const SHARED_TYPOGRAPHY_SCALE = {
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    xxl: '1.5rem', // 24px
    xxxl: '2rem', // 32px
  },
  fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 },
  lineHeight: { tight: '1.25', normal: '1.5', relaxed: '1.75', loose: '2' },
} as const;

const SHARED_SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
} as const;

const SHARED_BORDERS = {
  radius: { none: '0', sm: '0.25rem', md: '0.5rem', lg: '1rem', full: '9999px' },
  width: { thin: '1px', normal: '2px', thick: '4px' },
} as const;

const SHARED_SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
} as const;

const SHARED_LOADER_BEHAVIOR = {
  enableDebugMode: false,
  showMultipleLoadersWarning: false,
  autoHideAfterSuccess: true,
  preventMultipleCallsSameId: true,
  logPerformanceMetrics: false,
} as const;

const INTERNAL_BASE = 'https://api-services-internal-latam-assurance.staging.echonet/CO';
const SSO_BASE = 'https://latam-sso-assurance.dev.echonet:8443/auth';

export const BANKS_CONFIG: Record<string, BankConfig> = {
  occidente: {
    id: 'cardif-banco-occidente',
    name: 'Cardif Banco Occidente',
    themeName: 'theme-occidente',
    theme: {
      colors: {
        primary: {
          light: '#CCE8F5',
          main: '#0862C5',
          dark: '#333333',
          contrast: '#FFFFFF',
        },
        secondary: {
          light: '#B6BFCD',
          main: '#0D559B',
          dark: '#333333',
          contrast: '#FFFFFF',
        },
        accent: {
          main: '#009DD6',
          light: '#009DD614',
          dark: '#006B96',
          contrast: '#CCE6FF',
        },
        neutral: {
          background: '#EDFAFF',
          surface: '#F4F4F4', // fondo de las cards
          light: '#FFFFFF', // fondo del badge
          medium: '#434343', // texto del badge
          border: '#99A7B6', // borde de las cards
          divider: '#BBBBBB',
          disabled: '#EEEEEE',
          sky: '#FFFFFF', // fondo de la página
        },
        text: {
          primary: '#002449', // título de la página
          secondary: '#667C92',
          brand: '#333333',
          disabled: '#99A7B6',
          hint: '#B6BFCD',
        },
        status: {
          success: '#4caf50',
          warning: '#ff9800',
          error: '#f44336',
          info: '#008ACC',
        },
        border: { primary: '#B5ECFF', secondary: '#0862C5' },
        interactive: {
          hover: 'rgba(0, 138, 204, 0.08)',
          focus: 'rgba(0, 138, 204, 0.12)',
          active: 'rgba(0, 138, 204, 0.16)',
          visited: '#002449',
        },
      },
      typography: {
        fontFamily: {
          primary: 'Poppins, sans-serif',
          secondary: 'Arial, sans-serif',
          monospace: 'Consolas, monospace',
        },
        ...SHARED_TYPOGRAPHY_SCALE,
      },
      spacing: SHARED_SPACING,
      borders: SHARED_BORDERS,
      shadows: SHARED_SHADOWS,
    },
    loader: {
      defaultType: 'spinner',
      defaultSize: 'medium',
      defaultPosition: 'center',
      theme: {
        primaryColor: '#1565c0',
        secondaryColor: '#2196f3',
        backgroundColor: '#ffffff',
        overlayColor: 'rgba(21, 101, 192, 0.1)',
        borderRadius: '8px',
        shadow: '0 4px 12px rgba(21, 101, 192, 0.15)',
      },
      behavior: SHARED_LOADER_BEHAVIOR,
    },
    assets: {
      ...SHARED_ASSETS,
      logo: '/assets/logos/banco-occidente-logo.svg',
      logoFooter: '/assets/logos/banco-occidente-logo.svg',
    },
    api: {
      baseUrl: 'https://api-services-uat.cardifnet.com/CO/UAT',
      webview: '/wv_occidente',
      internalBase: INTERNAL_BASE,
      ssoBase: SSO_BASE,
    },
    interceptor: {
      xSourceName: 'wv_cardif_banco_occidente',
      endpointConfig: SHARED_ENDPOINT_CONFIG,
    },
  },

  tuya: {
    id: 'cardif-banco-tuya',
    name: 'Cardif Banco Tuya',
    themeName: 'theme-tuya',
    theme: {
      colors: {
        primary: {
          main: '#ED1C29',
          light: '#F7C3CD',
          dark: '#333333',
          contrast: '#FFFFFF',
        },
        secondary: {
          main: '#C40311',
          light: '#C3C5CA',
          dark: '#333333',
          contrast: '#FFFFFF',
        },
        accent: {
          main: '#77C3CD',
          light: '#F4F4F4',
          dark: '#002449',
          contrast: '#ed1c295c',
        },
        neutral: {
          background: '#F4F4F4',
          surface: '#FFEDED',
          light: '#C3C5CA',
          medium: '#ADADAD',
          border: '#7D8890',
          divider: '#5C5C5C',
          disabled: '#EEEEEE',
          sky: '#FFFFFF',
        },
        text: {
          primary: '#002449',
          secondary: '#404040',
          brand: '#333333',
          disabled: '#ADADAD',
          hint: '#7D8890',
        },
        status: {
          success: '#77C3CD',
          warning: '#ED1C29',
          error: '#ED1C29',
          info: '#77C3CD',
        },
        border: { primary: '#ED1C29', secondary: '#ED1C29' },
        interactive: {
          hover: 'rgba(237, 28, 41, 0.08)',
          focus: 'rgba(237, 28, 41, 0.12)',
          active: 'rgba(237, 28, 41, 0.16)',
          visited: '#002449',
        },
      },
      typography: {
        fontFamily: {
          primary: 'Roboto, sans-serif',
          secondary: 'Arial, sans-serif',
          monospace: 'Courier New, monospace',
        },
        ...SHARED_TYPOGRAPHY_SCALE,
      },
      spacing: SHARED_SPACING,
      borders: SHARED_BORDERS,
      shadows: SHARED_SHADOWS,
    },
    loader: {
      defaultType: 'spinner',
      defaultSize: 'medium',
      defaultPosition: 'center',
      theme: {
        primaryColor: '#d32f2f',
        secondaryColor: '#ff5722',
        backgroundColor: '#efefef',
        overlayColor: 'rgba(211, 47, 47, 0.1)',
        borderRadius: '8px',
        shadow: '0 4px 12px rgba(211, 47, 47, 0.15)',
      },
      behavior: SHARED_LOADER_BEHAVIOR,
    },
    assets: {
      ...SHARED_ASSETS,
      logo: '/assets/logos/tuya-logo.svg',
      logoFooter: '/assets/logos/tuya-logo.svg',
    },
    api: {
      baseUrl: 'https://api-services-uat.cardifnet.com/CO/UAT',
      webview: 'https://webview-uat.cardif.com.co/mashery-auth-service',
      internalBase: INTERNAL_BASE,
      ssoBase: SSO_BASE,
    },
    interceptor: {
      xSourceName: 'wv_cardif_banco_tuya',
      endpointConfig: SHARED_ENDPOINT_CONFIG,
    },
  },

  bogota: {
    id: 'cardif-banco-bogota',
    name: 'Cardif Banco Bogotá',
    themeName: 'theme-confianza',
    theme: {
      colors: {
        primary: {
          light: '#CCE8F5',
          main: '#1893cf',
          dark: '#002449',
          contrast: '#FFFFFF',
        },
        secondary: {
          light: '#B6BFCD',
          main: '#667C92',
          dark: '#333333',
          contrast: '#FFFFFF',
        },
        accent: {
          main: '#1893cf',
          light: '#009DD614',
          dark: '#1893cf',
          contrast: '#FFFFFF',
        },
        neutral: {
          background: '#EFF2FC',
          surface: '#FFFFFF',
          light: '#F6F8FA',
          medium: '#CCD3DB',
          border: '#99A7B6',
          divider: '#667C92',
          disabled: '#EEEEEE',
          sky: '#CCD3DB',
        },
        text: {
          primary: '#002449',
          secondary: '#667C92',
          brand: '#333333',
          disabled: '#99A7B6',
          hint: '#B6BFCD',
        },
        status: {
          success: '#4caf50',
          warning: '#ff9800',
          error: '#f44336',
          info: '#1893cf',
        },
        border: { primary: '#B5ECFF', secondary: '#0862C5' },
        interactive: {
          hover: 'rgba(0, 138, 204, 0.08)',
          focus: 'rgba(0, 138, 204, 0.12)',
          active: 'rgba(0, 138, 204, 0.16)',
          visited: '#002449',
        },
      },
      typography: {
        fontFamily: {
          primary: 'Open Sans, sans-serif',
          secondary: 'Arial, sans-serif',
          monospace: 'Consolas, monospace',
        },
        ...SHARED_TYPOGRAPHY_SCALE,
      },
      spacing: SHARED_SPACING,
      borders: SHARED_BORDERS,
      shadows: SHARED_SHADOWS,
    },
    loader: {
      defaultType: 'spinner',
      defaultSize: 'medium',
      defaultPosition: 'center',
      theme: {
        primaryColor: '#1565c0',
        secondaryColor: '#2196f3',
        backgroundColor: '#ffffff',
        overlayColor: 'rgba(21, 101, 192, 0.1)',
        borderRadius: '8px',
        shadow: '0 4px 12px rgba(21, 101, 192, 0.15)',
      },
      behavior: SHARED_LOADER_BEHAVIOR,
    },
    assets: {
      ...SHARED_ASSETS,
      logo: '/assets/logos/banco-bogota.png',
      logoFooter: '/assets/logos/banco-bogota.png',
    },
    api: {
      baseUrl: 'https://api-services-uat.cardifnet.com/CO/UAT',
      webview: 'https://webview-uat.cardif.com.co/mashery-auth-service',
      internalBase: INTERNAL_BASE,
      ssoBase: SSO_BASE,
    },
    interceptor: {
      xSourceName: 'wv_cardif_banco_bogota',
      endpointConfig: SHARED_ENDPOINT_CONFIG,
    },
  },

  'cardif-banco-default': {
    id: 'cardif-banco-default',
    name: 'Cardif Banco default',
    themeName: 'theme-default',
    theme: {
      colors: {
        primary: {
          main: '#bebabaff',
          light: '#bebabaff',
          dark: '#002449',
          contrast: '#FFFFFF',
        },
        secondary: {
          main: '#bebabaff',
          light: '#C3C5CA',
          dark: '#000000',
          contrast: '#FFFFFF',
        },
        accent: {
          main: '#bebabaff',
          light: '#F4F4F4',
          dark: '#002449',
          contrast: '#000000',
        },
        neutral: {
          background: '#F4F4F4',
          surface: '#FFFFFF',
          light: '#C3C5CA',
          medium: '#ADADAD',
          border: '#7D8890',
          divider: '#5C5C5C',
          disabled: '#EEEEEE',
          sky: '#CCD3DB',
        },
        text: {
          primary: '#333333',
          secondary: '#5C5C5C',
          brand: '#333333',
          disabled: '#ADADAD',
          hint: '#7D8890',
        },
        status: {
          success: '#bebabaff',
          warning: '#bebabaff',
          error: '#bebabaff',
          info: '#bebabaff',
        },
        border: { primary: '#B5ECFF', secondary: '#0862C5' },
        interactive: {
          hover: 'rgba(237, 28, 41, 0.08)',
          focus: 'rgba(237, 28, 41, 0.12)',
          active: 'rgba(237, 28, 41, 0.16)',
          visited: '#002449',
        },
      },
      typography: {
        fontFamily: {
          primary: 'Roboto, sans-serif',
          secondary: 'Arial, sans-serif',
          monospace: 'Courier New, monospace',
        },
        ...SHARED_TYPOGRAPHY_SCALE,
      },
      spacing: SHARED_SPACING,
      borders: SHARED_BORDERS,
      shadows: SHARED_SHADOWS,
    },
    loader: {
      defaultType: 'spinner',
      defaultSize: 'medium',
      defaultPosition: 'center',
      theme: {
        primaryColor: '#bebabaff',
        secondaryColor: '#bebabaff',
        backgroundColor: '#bebabaff',
        overlayColor: 'rgba(211, 47, 47, 0.1)',
        borderRadius: '8px',
        shadow: '0 4px 12px rgba(211, 47, 47, 0.15)',
      },
      behavior: SHARED_LOADER_BEHAVIOR,
    },
    assets: {
      ...SHARED_ASSETS,
      logo: '/assets/logos/banco-occidente-logo.svg',
      logoFooter: '/assets/logos/banco-occidente-logo.svg',
    },
    api: {
      baseUrl: 'https://api-services-uat.cardifnet.com/CO/UAT',
      webview: 'https://webview-uat.cardif.com.co/mashery-auth-service',
      internalBase: INTERNAL_BASE,
      ssoBase: SSO_BASE,
    },
    interceptor: {
      xSourceName: 'wv_cardif_banco_default',
      endpointConfig: SHARED_ENDPOINT_CONFIG,
    },
  },
};

export const BANKS_CONFIG_DEFAULT = 'cardif-banco-default';
