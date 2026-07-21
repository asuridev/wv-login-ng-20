import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap, Router, UrlTree } from '@angular/router';

import { partnerGuard } from './partner-guard';

describe('partnerGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;
  const notFoundTree = {} as UrlTree;

  function routeWith(partnerId: string | null): ActivatedRouteSnapshot {
    return {
      paramMap: convertToParamMap(partnerId === null ? {} : { partnerId }),
    } as ActivatedRouteSnapshot;
  }

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
    routerSpy.createUrlTree.and.returnValue(notFoundTree);

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: Router, useValue: routerSpy }],
    });
  });

  it('permite el acceso cuando el partnerId existe en BANKS_CONFIG', () => {
    const result = TestBed.runInInjectionContext(() =>
      partnerGuard(routeWith('occidente'), {} as never)
    );

    expect(result).toBe(true);
    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirige a not-found cuando el partnerId no existe', () => {
    const result = TestBed.runInInjectionContext(() =>
      partnerGuard(routeWith('no-existe'), {} as never)
    );

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/not-found']);
    expect(result).toBe(notFoundTree);
  });

  it('redirige a not-found cuando la ruta no trae partnerId', () => {
    const result = TestBed.runInInjectionContext(() => partnerGuard(routeWith(null), {} as never));

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/not-found']);
    expect(result).toBe(notFoundTree);
  });
});
