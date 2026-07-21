import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { DEFAULT_PARTNER_TEXT, PARTNERS_TEXT } from '../config/partners-register';
import { BANKS_CONFIG, BANKS_CONFIG_DEFAULT } from '../config/partners/configurations/banks-config';
import { BankConfig, PartnerText } from '../models/partner-theme-model';
import { DeviceType } from '../services/device-info';

type PartnerState = {
  partnerId: string | null;
  config: BankConfig | null;
  text: PartnerText | null;
  correlationId: string | null;
  productType: number | null;
  advisorId: string | null;
  ip: string | null;
  deviceType: DeviceType | null;
};

const initialState: PartnerState = {
  partnerId: null,
  config: null,
  text: null,
  correlationId: null,
  productType: null,
  advisorId: null,
  ip: null,
  deviceType: null,
};

/**
 * Estado síncrono del partner activo: configuración de marca, textos y los
 * datos de traza que acompañan la venta. No modela datos de servidor.
 */
export const PartnerStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ config, text }) => ({
    assets: computed(() => config()?.assets ?? null),
    bodyTitle: computed(() => text()?.body.title ?? ''),
    cards: computed(() => text()?.body.cards ?? []),
  })),
  withMethods((store) => ({
    /** Resuelve un `partnerId` de ruta contra la configuración, con fallback. */
    setPartner(partnerId: string): void {
      const resolvedId = BANKS_CONFIG[partnerId] ? partnerId : BANKS_CONFIG_DEFAULT;
      patchState(store, {
        partnerId: resolvedId,
        config: BANKS_CONFIG[resolvedId],
        text: PARTNERS_TEXT[resolvedId] ?? PARTNERS_TEXT[DEFAULT_PARTNER_TEXT],
      });
    },
    setIp(ip: string): void {
      patchState(store, { ip });
    },
    setDeviceType(deviceType: DeviceType): void {
      patchState(store, { deviceType });
    },
    setCorrelationId(correlationId: string): void {
      patchState(store, { correlationId });
    },
    setAdvisorId(advisorId: string): void {
      patchState(store, { advisorId });
    },
    setProductType(productType: number): void {
      patchState(store, { productType });
    },
  }))
);
