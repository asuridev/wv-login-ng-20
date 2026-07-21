interface SectionText {
  title: string;
  text: string;
  permission?: string;
}

interface CardText {
  cardButton: { label: string; redirecTo: string; productType: number };
  cardBadge: { label: string };
}

export type PartnerCardText = SectionText & CardText;

export interface PartnerText {
  header: SectionText;
  footer: SectionText;
  body: SectionText & {
    cards: PartnerCardText[];
  };
}

export interface BankConfig {
  id: string;
  name: string;
  themeName: string;
  theme: ConfigTheme;
  loader: Loader;
  assets: Assets;
  api: Api;
  interceptor: Interceptor;
}

export interface Api {
  baseUrl: string;
  webview: string;
  internalBase: string;
  ssoBase: string;
}

export interface Assets {
  logo: string;
  logoCardif: string;
  logoFooter: string;
  logoVigilado: string;
  logoAval: string;
  favicon: string;
  images: Images;
}

export interface Images {
  hero: string;
  background: string;
  userOne: string;
  eduDigital: string;
  entreFisico: string;
  declaRenta: string;
  iconEdit: string;
  iconDelete: string;
  armarSeguro: string;
  crearOferta: string;
}

export interface Interceptor {
  xSourceName: string;
  endpointConfig: EndpointConfig;
}

export interface EndpointConfig {
  '/jwt': Jwe;
  '/jwe': Jwe;
  '/customer/v1/internal/contact_info': ContactInfoEndpoint;
  '/customer/v1/extenal/contact_info': ContactInfoEndpoint;
  '/digital_sales/v1/contactData': ContactInfoEndpoint;
}

export interface ContactInfoEndpoint {
  enabled: boolean;
}

export interface Jwe {
  enabled: boolean;
  authRequired: boolean;
}

export interface Loader {
  defaultType: string;
  defaultSize: string;
  defaultPosition: string;
  theme: LoaderTheme;
  behavior: Behavior;
}

export interface Behavior {
  enableDebugMode: boolean;
  showMultipleLoadersWarning: boolean;
  autoHideAfterSuccess: boolean;
  preventMultipleCallsSameId: boolean;
  logPerformanceMetrics: boolean;
}

export interface LoaderTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  overlayColor: string;
  borderRadius: string;
  shadow: string;
}

export interface ConfigTheme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  borders: Borders;
  shadows: Shadows;
}

export interface Borders {
  radius: Radius;
  width: Width;
}

export interface Radius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  full: string;
}

export interface Width {
  thin: string;
  normal: string;
  thick: string;
}

export interface Colors {
  primary: Accent;
  secondary: Accent;
  accent: Accent;
  neutral: Neutral;
  text: Text;
  status: Status;
  border: Border;
  interactive: Interactive;
}

export interface Accent {
  main: string;
  light: string;
  dark: string;
  contrast: string;
}

export interface Border {
  primary: string;
  secondary: string;
}

export interface Interactive {
  hover: string;
  focus: string;
  active: string;
  visited: string;
}

export interface Neutral {
  background: string;
  surface: string;
  light: string;
  medium: string;
  border: string;
  divider: string;
  disabled: string;
  sky: string;
}

export interface Status {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Text {
  primary: string;
  secondary: string;
  brand: string;
  disabled: string;
  hint: string;
}

export interface Shadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface Typography {
  fontFamily: FontFamily;
  fontSize: FontSize;
  fontWeight: FontWeight;
  lineHeight: LineHeight;
}

export interface FontFamily {
  primary: string;
  secondary: string;
  monospace: string;
}

export interface FontSize {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  xxl: string;
  xxxl: string;
}

export interface FontWeight {
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
}

export interface LineHeight {
  tight: string;
  normal: string;
  relaxed: string;
  loose: string;
}
