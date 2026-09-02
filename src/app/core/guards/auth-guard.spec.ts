import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import Keycloak from 'keycloak-js';

import { KeycloakInit } from '../services/keycloak-init';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  let login: jasmine.Spy;

  function configureWith(authenticated: boolean): void {
    TestBed.resetTestingModule();
    login = jasmine.createSpy('login').and.resolveTo(undefined);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Keycloak, useValue: { login } as unknown as Keycloak },
        { provide: KeycloakInit, useValue: { ensureInitialized: () => Promise.resolve(authenticated) } },
      ],
    });
  }

  function activate(url: string): Promise<boolean> {
    return TestBed.runInInjectionContext(
      () =>
        authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot) as Promise<boolean>
    );
  }

  it('deja pasar cuando hay sesión activa, sin pedir login', async () => {
    configureWith(true);

    expect(await activate('/occidente/home')).toBeTrue();
    expect(login).not.toHaveBeenCalled();
  });

  it('redirige a Keycloak conservando la URL destino cuando no hay sesión', async () => {
    configureWith(false);

    expect(await activate('/occidente/home')).toBeFalse();
    expect(login).toHaveBeenCalledOnceWith({
      redirectUri: `${window.location.origin}/occidente/home`,
    });
  });

  it('descarta el fragmento del callback al construir el redirectUri', async () => {
    configureWith(false);

    await activate('/occidente#error=login_required&state=abc');

    expect(login).toHaveBeenCalledOnceWith({
      redirectUri: `${window.location.origin}/occidente`,
    });
  });
});
