import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeApplier } from '../../../core/services/theme-applier';
import { PartnerStore } from '../../../core/store/partner.store';

/**
 * Shell de las rutas `/:partnerId`. Recibe el segmento de partner vía
 * `withComponentInputBinding()` y lo publica en el store, que es lo que
 * dispara la aplicación del tema.
 */
@Component({
  selector: 'app-partner-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  host: { class: 'block min-h-dvh bg-neutral-sky' },
  template: `<router-outlet />`,
})
export class PartnerLayout {
  readonly partnerId = input.required<string>();

  private readonly partnerStore = inject(PartnerStore);

  constructor() {
    // Instanciar el applier aquí lo mantiene vivo mientras dure el shell.
    inject(ThemeApplier);

    effect(() => this.partnerStore.setPartner(this.partnerId()));
  }
}
