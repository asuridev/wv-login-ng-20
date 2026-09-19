import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import Keycloak from 'keycloak-js';

import { environment } from '../../../environments/environment';
import { RedirectService } from './redirect';

describe('RedirectService', () => {
  let service: RedirectService;
  let navigate: jasmine.Spy<(url: string) => void>;
  let keycloak: jasmine.SpyObj<Keycloak> & { idToken?: string };

  beforeEach(() => {
    keycloak = jasmine.createSpyObj<Keycloak>('Keycloak', ['updateToken', 'login']);
    keycloak.updateToken.and.resolveTo(true);
    keycloak.login.and.resolveTo();
    keycloak.idToken = 'id-token-de-prueba';

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: Keycloak, useValue: keycloak }],
    });

    service = TestBed.inject(RedirectService);
    // `navigate` es protected; se espía para no navegar el runner de Karma.
    navigate = spyOn(service as unknown as { navigate: (url: string) => void }, 'navigate');
  });

  function authUrl(): URL {
    return new URL(navigate.calls.mostRecent().args[0]);
  }

  it('usa el client recibido por parámetro', async () => {
    await service.redirectTo('https://destino.example', '/home', 'client-de-prueba');

    expect(authUrl().searchParams.get('client_id')).toBe('client-de-prueba');
  });

  it('construye el redirect_uri a partir de la URL recibida', async () => {
    await service.redirectTo('https://destino.example/wv_demo', '/home', 'client-de-prueba');

    expect(authUrl().searchParams.get('redirect_uri')).toBe(
      'https://destino.example/wv_demo/auth/callback'
    );
  });

  it('pide SSO silencioso identificando al usuario con su id token', async () => {
    await service.redirectTo('https://destino.example', '/home', 'client-de-prueba');

    expect(authUrl().searchParams.get('prompt')).toBe('none');
    expect(authUrl().searchParams.get('id_token_hint')).toBe('id-token-de-prueba');
  });

  // Issuer y realm se derivan del environment: cambiar la configuración de
  // Keycloak no debe romper este test.
  it('apunta al endpoint de autorización del realm configurado', async () => {
    await service.redirectTo('https://destino.example', '/home', 'client-de-prueba');

    const { issuer, realm } = environment.keycloak;
    expect(`${authUrl().origin}${authUrl().pathname}`).toBe(
      `${issuer}/realms/${realm}/protocol/openid-connect/auth`
    );
  });

  it('vuelve a autenticar en lugar de redirigir si no puede refrescar el token', async () => {
    keycloak.updateToken.and.rejectWith(new Error('sesión expirada'));

    await service.redirectTo('https://destino.example', '/home', 'client-de-prueba');

    expect(keycloak.login).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
