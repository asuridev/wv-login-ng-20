import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';

import { CardFlowName, DEFAULT_CARD_FLOW } from '../../../core/models/card-flow-model';
import { PartnerStore } from '../../../core/store/partner.store';
import { ToastStore } from '../../../core/store/toast.store';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';
import { Card } from '../../../shared/ui/card';
import { CardFlowResolver } from '../flows/card-flow-resolver';

const ERROR_TITLE = 'Ocurrió un error';
/** Genérico a propósito: el mismo texto sirve para cualquier flujo. */
const ERROR_MESSAGE = 'No fue posible continuar. Intenta nuevamente.';

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
  readonly flow = input<CardFlowName>(DEFAULT_CARD_FLOW);

  private readonly partnerStore = inject(PartnerStore);
  private readonly toastStore = inject(ToastStore);
  private readonly flowResolver = inject(CardFlowResolver);

  /** Bloquea el botón desde el click hasta que el flujo falla o la página navega. */
  protected readonly submitting = signal(false);

  /**
   * Qué ocurre al pulsar depende del flujo que declare la card; el componente
   * solo delega. El manejo del error vive aquí a propósito: la respuesta visual
   * debe ser la misma sea cual sea el flujo que haya fallado.
   */
  async onClick(): Promise<void> {
    if (this.submitting()) return;
    this.submitting.set(true);

    try {
      await this.flowResolver.resolve(this.flow()).run({
        url: this.redirectTo(),
        productType: this.productType() ?? 0,
        partnerId: this.partnerStore.partnerId() ?? '',
      });
    } catch {
      // El error ya lo normaliza el errorInterceptor; aquí se avisa al usuario
      // y se evita el redirect.
      this.toastStore.error(ERROR_TITLE, ERROR_MESSAGE);
    } finally {
      this.submitting.set(false);
    }
  }
}
