import { Injectable, inject } from '@angular/core';
import { queryOptions } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

import { IpApiService } from '../services/ip-api';

@Injectable({ providedIn: 'root' })
export class IpQueries {
  private readonly ipApi = inject(IpApiService);

  publicIp() {
    return queryOptions({
      queryKey: ['ip', 'public'],
      queryFn: () => firstValueFrom(this.ipApi.getIp()),
      // La IP pública no cambia durante la sesión del webview.
      staleTime: Infinity,
      retry: false,
    });
  }
}
