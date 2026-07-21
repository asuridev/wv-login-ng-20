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
      class="flex items-center justify-between border-t border-neutral-divider bg-neutral-surface px-4 py-4 md:px-footer-x"
    >
      @if (assets) {
        <div class="flex items-center gap-4">
          <img
            [ngSrc]="assets.logoVigilado"
            width="183"
            height="18"
            alt="Vigilado Superintendencia Financiera de Colombia"
            class="hidden sm:block"
          />
          <span class="hidden h-12 w-px bg-neutral-divider sm:block"></span>
          <img
            [ngSrc]="assets.logoFooter"
            width="137"
            height="47"
            alt="Logo del banco"
            class="h-12 w-auto"
          />
          <span class="h-12 w-px bg-neutral-divider"></span>
          <img [ngSrc]="assets.logoAval" width="125" height="35" alt="Grupo Aval" />
        </div>
        <img
          [ngSrc]="assets.logoCardif"
          width="139"
          height="24"
          alt="Seguros Alfa"
          class="hidden sm:block"
        />
      }
    </footer>
  `,
})
export class HomeFooter {
  protected readonly partnerStore = inject(PartnerStore);
}
