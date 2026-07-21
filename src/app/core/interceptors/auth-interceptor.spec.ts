import { HttpRequest } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import Keycloak from 'keycloak-js';
import { of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  function configureWith(token: string | undefined): void {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Keycloak, useValue: { token } as unknown as Keycloak },
      ],
    });
  }

  function intercept(url: string): HttpRequest<unknown> {
    let forwarded!: HttpRequest<unknown>;

    TestBed.runInInjectionContext(() =>
      authInterceptor(new HttpRequest('GET', url), (req) => {
        forwarded = req;
        return of();
      })
    ).subscribe();

    return forwarded;
  }

  it('adjunta el token a las peticiones del propio origen', () => {
    configureWith('abc');

    expect(intercept('/api/session').headers.get('Authorization')).toBe('Bearer abc');
  });

  it('adjunta el token a las APIs propias declaradas en environment', () => {
    configureWith('abc');

    expect(intercept(environment.urls.persistenteApi).headers.get('Authorization')).toBe(
      'Bearer abc'
    );
  });

  it('no adjunta el token a servicios públicos de terceros', () => {
    configureWith('abc');

    expect(intercept(environment.urls.ip).headers.has('Authorization')).toBeFalse();
  });

  it('no modifica la petición cuando no hay sesión', () => {
    configureWith(undefined);

    expect(intercept('/api/session').headers.has('Authorization')).toBeFalse();
  });
});
