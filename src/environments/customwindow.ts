export class CustomWindow {
  static instance = new CustomWindow();
  getWindowAttribute(envProperty: string, defaultValue?: string): string | undefined {
    // @ts-ignore
    if (window['env'].hasOwnProperty(envProperty)) {
      // @ts-ignore
      return window['env'][envProperty];
    }
    return defaultValue;
  }
}
