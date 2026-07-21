import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
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
  template: `
    <ui-card>
      <div class="flex h-full w-card-body flex-col items-start gap-card-gap py-5 pl-5">
        <ui-badge>{{ labelBadge() }}</ui-badge>
        <h5 class="text-xxl/8 font-semibold text-text-brand">{{ title() }}</h5>
        <div class="pt-4">
          <button ui-button (click)="onClick()">{{ labelButton() }}</button>
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

  onClick(): void {
    this.saleCompleted.mutate();
    this.partnerStore.setProductType(this.productType() ?? 0);
    void this.redirectService.redirectTo(
      `${this.redirectTo()}/wv_${this.partnerStore.partnerId()}`,
      '/home'
    );
  }
}
