import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

import { PartnerStore } from '../../../core/store/partner.store';
import { Button } from '../../../shared/ui/button';

@Component({
  selector: 'home-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
  template: `
    <header
      class="flex h-header items-center justify-end border-b border-neutral-divider bg-neutral-surface px-4"
    >
      <button ui-button variant="ghost" (click)="logout()">
        <span>Cerrar Sesión</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-56-56 104-104H360v-80h328L584-624l56-56 200 200-200 200Z"
          />
        </svg>
      </button>
    </header>
  `,
})
export class HomeHeader {
  private readonly keycloak = inject(Keycloak);
  private readonly partnerStore = inject(PartnerStore);

  async logout(): Promise<void> {
    const redirectUri = `${window.location.origin}/${this.partnerStore.partnerId()}`;
    await this.keycloak.logout({ redirectUri });
  }
}
