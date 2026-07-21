import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { PARTNER_ID_MAP } from '../../../core/config/partner-id-map';
import { CHANNEL, SUB_CHANNEL } from '../../../core/constants/mashery-constant';
import { PartnerStore } from '../../../core/store/partner.store';
import { SaleCompletedRequest, SaleInformation } from '../models/sale-completed-model';
import { MasheryApiService } from '../services/mashery-api';

@Injectable({ providedIn: 'root' })
export class MasheryQueries {
  private readonly masheryApi = inject(MasheryApiService);
  private readonly partnerStore = inject(PartnerStore);

  /** Opciones de mutación para registrar la venta al salir hacia el webview. */
  sendSaleCompleted() {
    return {
      mutationKey: ['mashery', 'sale-completed'],
      mutationFn: () => firstValueFrom(this.masheryApi.sendSaleCompleted(this.buildRequest())),
    };
  }

  private buildRequest(): SaleCompletedRequest {
    return {
      correlationId: this.partnerStore.correlationId(),
      partnerId: PARTNER_ID_MAP[this.partnerStore.partnerId() ?? ''],
      saleInformation: JSON.stringify(this.buildSaleInformation()),
    };
  }

  private buildSaleInformation(): SaleInformation {
    const advisorId = Number(this.partnerStore.advisorId());

    return {
      personalInformation: {},
      propensityModel: {},
      collectionInformation: [],
      incentiveInformation: {
        channel: CHANNEL,
        subChannel: SUB_CHANNEL,
        advisorId: Number.isNaN(advisorId) ? 0 : advisorId,
        advisoryOfficeCode: 0,
        cityOfficeCode: '',
        departmentOfficeCode: '',
      },
      trace: {
        ip: this.partnerStore.ip() ?? '',
        deviceType: this.partnerStore.deviceType(),
      },
    };
  }
}
