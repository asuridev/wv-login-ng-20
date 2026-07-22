import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import Keycloak from 'keycloak-js';

import { environment } from '../../../../../environments/environment';
import { IpQueries } from '../../../../core/queries/ip-queries';
import { DeviceInfoService } from '../../../../core/services/device-info';
import { PartnerStore } from '../../../../core/store/partner.store';
import { HomeCard } from '../../components/home-card';
import { HomeFooter } from '../../components/home-footer';
import { HomeHeader } from '../../components/home-header';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HomeHeader, HomeFooter, HomeCard],
  template: `
    <div class="flex min-h-dvh flex-col bg-neutral-sky">
      <home-header />

      <main class="flex flex-1 flex-col justify-center px-4 py-8">
        <h1 class="mb-7 text-center text-xxxl font-semibold text-text-primary">
          {{ partnerStore.bodyTitle() }}
        </h1>

        <div
          class="mx-auto grid w-full max-w-5xl grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          @for (card of visibleCards(); track card.title) {
            <home-card
              [title]="card.title"
              [labelButton]="card.cardButton.label"
              [labelBadge]="card.cardBadge.label"
              [redirectTo]="card.cardButton.redirecTo"
              [productType]="card.cardButton.productType"
            />
          }
        </div>
      </main>

      <home-footer />
    </div>
  `,
})
export default class Home {
  protected readonly partnerStore = inject(PartnerStore);

  private readonly keycloak = inject(Keycloak);
  private readonly deviceInfoService = inject(DeviceInfoService);
  private readonly ipQueries = inject(IpQueries);

  private readonly ipQuery = injectQuery(() => this.ipQueries.publicIp());

  private readonly userPermissions = computed<string[]>(() => {
    const roles =
      this.keycloak.tokenParsed?.['resource_access']?.[environment.keycloak.clientId]?.roles;
    return Array.isArray(roles) ? roles : [];
  });

  protected readonly visibleCards = computed(() =>
    this.partnerStore
      .cards()
      .filter((card) => !card.permission || this.userPermissions().includes(card.permission))
  );

  constructor() {
    this.partnerStore.setDeviceType(this.deviceInfoService.getDeviceType());
    this.partnerStore.setCorrelationId(crypto.randomUUID());
    this.partnerStore.setAdvisorId(this.keycloak.tokenParsed?.['preferred_username'] ?? '');

    effect(() => {
      const ip = this.ipQuery.data();
      if (ip) this.partnerStore.setIp(ip);
    });
  }
}
