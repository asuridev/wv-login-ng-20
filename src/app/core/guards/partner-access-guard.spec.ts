import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap, Router, UrlTree } from '@angular/router';
import Keycloak from 'keycloak-js';

import { PARTNER_ID_MAP } from '../config/partner-id-map';
import { TEST_PARTNER } from '../config/partners-test-support';
import { partnerAccessGuard } from './partner-access-guard';

/** Un id de otro partner, para el caso en que el token no autoriza el de la ruta. */
const OTRO_PARTNER_ID = Object.entries(PARTNER_ID_MAP).find(
  ([partnerId]) => partnerId !== TEST_PARTNER
)![1];

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
    configureWith([PARTNER_ID_MAP[TEST_PARTNER]]);

    const result = TestBed.runInInjectionContext(() =>
      partnerAccessGuard(routeWith(TEST_PARTNER), {} as never)
    );

    expect(result).toBe(true);
  });

  it('redirige a not-found cuando el token no autoriza el partner', () => {
    configureWith([OTRO_PARTNER_ID]);

    const result = TestBed.runInInjectionContext(() =>
      partnerAccessGuard(routeWith(TEST_PARTNER), {} as never)
    );

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/not-found']);
    expect(result).toBe(notFoundTree);
  });

  it('redirige a not-found cuando el token no trae el claim partner_id', () => {
    configureWith(undefined);

    const result = TestBed.runInInjectionContext(() =>
      partnerAccessGuard(routeWith(TEST_PARTNER), {} as never)
    );

    expect(result).toBe(notFoundTree);
  });
});
