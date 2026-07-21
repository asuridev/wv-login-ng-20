import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { SaleCompletedRequest } from '../models/sale-completed-model';

/** Envuelve el endpoint de persistencia de venta de Mashery. */
@Injectable({ providedIn: 'root' })
export class MasheryApiService {
  private readonly httpClient = inject(HttpClient);

  sendSaleCompleted(payload: SaleCompletedRequest): Observable<unknown> {
    return this.httpClient.post(environment.urls.persistenteApi, payload);
  }
}
