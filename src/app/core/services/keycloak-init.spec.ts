import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import Keycloak, { KeycloakInitOptions } from 'keycloak-js';

import { KeycloakInit } from './keycloak-init';

describe('KeycloakInit', () => {
  let init: jasmine.Spy<(options: KeycloakInitOptions) => Promise<boolean>>;

  beforeEach(() => {
    init = jasmine.createSpy('init').and.resolveTo(true);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Keycloak, useValue: { init } as unknown as Keycloak },
      ],
    });
  });

  it('inicializa con check-sso sin el iframe de login', async () => {
    await TestBed.inject(KeycloakInit).ensureInitialized();

    expect(init).toHaveBeenCalledOnceWith({ onLoad: 'check-sso', checkLoginIframe: false });
  });

  it('inicializa una sola vez aunque se invoque varias veces', async () => {
    const service = TestBed.inject(KeycloakInit);

    const results = await Promise.all([
      service.ensureInitialized(),
      service.ensureInitialized(),
    ]);
    await service.ensureInitialized();

    expect(init).toHaveBeenCalledTimes(1);
    expect(results).toEqual([true, true]);
  });

  it('propaga el estado de sesión devuelto por Keycloak', async () => {
    init.and.resolveTo(false);

    expect(await TestBed.inject(KeycloakInit).ensureInitialized()).toBeFalse();
  });
});
