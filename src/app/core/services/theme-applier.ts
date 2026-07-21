import { DOCUMENT, Injectable, effect, inject } from '@angular/core';

import { ConfigTheme } from '../models/partner-theme-model';
import { PartnerStore } from '../store/partner.store';

/**
 * Proyecta el tema del partner activo sobre los tokens del design system
 * (`@theme` en `src/styles.css`) sobrescribiendo las CSS vars en `:root`,
 * y sincroniza favicon y título del documento.
 */
@Injectable({ providedIn: 'root' })
export class ThemeApplier {
  private readonly document = inject(DOCUMENT);
  private readonly partnerStore = inject(PartnerStore);

  constructor() {
    effect(() => {
      const config = this.partnerStore.config();
      if (!config) return;

      this.applyTokens(config.theme);
      this.updateFavicon(config.assets.favicon);
      this.document.title = config.name;
    });
  }

  private applyTokens(theme: ConfigTheme): void {
    const { colors, typography } = theme;
    const root = this.document.documentElement;

    const groups: Record<string, object> = {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      neutral: colors.neutral,
      text: colors.text,
      status: colors.status,
      border: colors.border,
      interactive: colors.interactive,
    };

    for (const [group, values] of Object.entries(groups)) {
      for (const [key, value] of Object.entries(values)) {
        root.style.setProperty(`--color-${group}-${key}`, String(value));
      }
    }

    root.style.setProperty('--font-partner', typography.fontFamily.primary);

    for (const [key, value] of Object.entries(typography.fontSize)) {
      root.style.setProperty(`--text-${key}`, value);
    }

    for (const [key, value] of Object.entries(typography.fontWeight)) {
      root.style.setProperty(`--font-weight-${key}`, String(value));
    }
  }

  private updateFavicon(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'icon';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }
}
