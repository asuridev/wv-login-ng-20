import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Pagina publica terminal: el flujo al que apunta el enlace ya no existe.
 * Solo se alcanza escribiendo/redirigiendo a `/gone` (semantica HTTP 410).
 *
 * El tratamiento visual replica el theme de Keycloak `webview-login` (fondo
 * gris plano, tarjeta blanca centrada, sin header/footer/logo) a traves de los
 * tokens `login-*` de `src/styles.css`.
 */
@Component({
  selector: 'app-gone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block font-login' },
  template: `
    <main
      class="flex min-h-dvh flex-col items-center justify-center bg-login-page px-3.5 pt-5 pb-login-page-bottom xs:px-4 xs:pt-8 xs:pb-login-page-bottom-lg"
    >
      <section
        class="w-full max-w-login-card rounded-login-card-sm bg-login-surface px-login-card-x-sm py-login-card-y-sm text-center shadow-login-card-sm xs:rounded-login-card xs:px-login-card-x xs:py-login-card-y xs:shadow-login-card"
      >
        <p class="mb-1 text-login-eyebrow leading-5 font-medium text-login-title">Lo sentimos</p>
        <h1 class="text-login-heading leading-5 font-medium text-login-subtitle">
          Esta página ya no está disponible
        </h1>
        <p class="mt-2.5 text-login-body leading-login-body text-login-muted">
          El enlace que intentas abrir fue retirado y ya no se encuentra activo. Si llegaste aquí
          desde un correo o un mensaje, comunícate con tu banco para obtener un enlace vigente.
        </p>
      </section>
    </main>
  `,
})
export default class Gone {}
