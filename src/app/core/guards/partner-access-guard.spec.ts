import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap, Router, UrlTree } from '@angular/router';
import Keycloak from 'keycloak-js';

import { partnerAccessGuard } from './partner-access-guard';

describe('partnerAccessGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;
  const notFoundTree = {} as UrlTree;

  function routeWith(partnerId: string): ActivatedRouteSnapshot {
    return { paramMap: convertToParamMap({ partnerId }) } as ActivatedRouteSnapshot;
  }

  function configureWith(partnerIds: unknown): void {
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
    routerSpy.createUrlTree.and.returnValue(notFoundTree);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: routerSpy },
        {
          provide: Keycloak,
          useValue: { tokenParsed: { partner_id: partnerIds } } as unknown as Keycloak,
        },
      ],
    });
  }

  it('permite el acceso cuando el token autoriza el partner de la ruta', () => {
    // 'occidente' se mapea a '11' en PARTNER_ID_MAP.
    configureWith(['11']);

    const result = TestBed.runInInjectionContext(() =>
      partnerAccessGuard(routeWith('occidente'), {} as never)
    );

    expect(result).toBe(true);
  });

  it('redirige a not-found cuando el token no autoriza el partner', () => {
    configureWith(['19']);

    const result = TestBed.runInInjectionContext(() =>
      partnerAccessGuard(routeWith('occidente'), {} as never)
    );

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/not-found']);
    expect(result).toBe(notFoundTree);
  });

  it('redirige a not-found cuando el token no trae el claim partner_id', () => {
    configureWith(undefined);

    const result = TestBed.runInInjectionContext(() =>
      partnerAccessGuard(routeWith('occidente'), {} as never)
    );

    expect(result).toBe(notFoundTree);
  });
});
