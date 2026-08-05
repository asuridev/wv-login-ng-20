import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query-experimental';

import { RedirectService } from '../../../core/services/redirect';
import { PartnerStore } from '../../../core/store/partner.store';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';
import { Card } from '../../../shared/ui/card';
import { MasheryQueries } from '../queries/mashery-queries';

@Component({
  selector: 'home-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card, Badge, Button],
  host: { class: 'block w-full max-w-card' },
  template: `
    <ui-card>
      <div class="flex h-full w-full flex-col items-start gap-card-gap py-5 pr-5 pl-5">
        <ui-badge>{{ labelBadge() }}</ui-badge>
        <h5 class="text-xxl/8 font-semibold text-text-brand">{{ title() }}</h5>
        <div class="pt-4">
          <button ui-button [disabled]="submitting()" (click)="onClick()">
            {{ submitting() ? 'Cargando...' : labelButton() }}
          </button>
        </div>
      </div>
    </ui-card>
  `,
})
export class HomeCard {
  readonly title = input('');
  readonly labelButton = input('');
  readonly labelBadge = input('');
  readonly redirectTo = input('');
  readonly productType = input<number | undefined>(undefined);

  private readonly partnerStore = inject(PartnerStore);
  private readonly redirectService = inject(RedirectService);
  private readonly masheryQueries = inject(MasheryQueries);

  private readonly saleCompleted = injectMutation(() => this.masheryQueries.sendSaleCompleted());

  /** Bloquea el botón desde el click hasta que la mutación falla o la página navega. */
  protected readonly submitting = signal(false);

  async onClick(): Promise<void> {
    if (this.submitting()) return;
    this.submitting.set(true);

    // Se fijan antes de mutar: RedirectService los lee para el `state` del auth URL.
    this.partnerStore.setProductType(this.productType() ?? 0);
    // Cada flujo de redirección viaja con su propio correlationId.
    this.partnerStore.newCorrelationId();

    try {
      await this.saleCompleted.mutateAsync();
    } catch {
      // El error ya lo normaliza el errorInterceptor; aquí sólo se evita el redirect.
      this.submitting.set(false);
      return;
    }

    await this.redirectService.redirectTo(
      `${this.redirectTo()}/wv_${this.partnerStore.partnerId()}`,
      '/home'
    );
    this.submitting.set(false);
  }
}
