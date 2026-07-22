import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PartnerStore } from '../../../core/store/partner.store';

@Component({
  selector: 'home-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  template: `
    @let assets = partnerStore.assets();

    <footer
      class="flex flex-wrap items-center justify-between gap-y-3 border-t border-neutral-divider bg-neutral-surface px-4 py-4 lg:px-8 xl:px-footer-x"
    >
      @if (assets) {
        <div class="flex items-center gap-3 lg:gap-4">
          <img
            [ngSrc]="assets.logoVigilado"
            width="183"
            height="18"
            alt="Vigilado Superintendencia Financiera de Colombia"
            class="hidden h-2 w-auto shrink-0 sm:block lg:h-[18px]"
          />
          <span class="hidden h-8 w-px shrink-0 bg-neutral-divider sm:block lg:h-12"></span>
          <img
            [ngSrc]="assets.logoFooter"
            width="137"
            height="47"
            alt="Logo del banco"
            class="h-6 w-auto shrink-0 sm:h-8 lg:h-12"
          />
          <span class="h-8 w-px shrink-0 bg-neutral-divider lg:h-12"></span>
          <img
            [ngSrc]="assets.logoAval"
            width="125"
            height="35"
            alt="Grupo Aval"
            class="h-5 w-auto shrink-0 sm:h-6 lg:h-[35px]"
          />
        </div>
        <img
          [ngSrc]="assets.logoCardif"
          width="139"
          height="24"
          alt="Seguros Alfa"
          class="hidden h-4 w-auto shrink-0 sm:block lg:h-6"
        />
      }
    </footer>
  `,
})
export class HomeFooter {
  protected readonly partnerStore = inject(PartnerStore);
}
