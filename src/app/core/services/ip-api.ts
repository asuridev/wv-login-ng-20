import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';

/** Envuelve el servicio público de IP; sin lógica de negocio ni estado. */
@Injectable({ providedIn: 'root' })
export class IpApiService {
  private readonly httpClient = inject(HttpClient);

  getIp(): Observable<string> {
    return this.httpClient
      .get<{ ip: string }>(environment.urls.ip)
      .pipe(map((response) => response.ip));
  }
}
