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
        <h1 class="text-login-body leading-login-body font-normal text-login-subtitle">
          Lamentamos informarle que
          <strong class="font-semibold text-login-title"
            >esta página ya no se encuentra disponible</strong
          >.
        </h1>
        <p class="mt-3 text-login-body leading-login-body text-login-subtitle">
          El enlace al que ha intentado acceder ha sido retirado y no está activo en la actualidad.
        </p>
        <p class="mt-3 text-login-body leading-login-body text-login-subtitle">
          <strong class="font-semibold text-login-title"
            >Para obtener un enlace vigente o encontrar la información que busca</strong
          >, le invitamos a comunicarse con su
          <strong class="font-semibold text-login-title"
            >entidad o línea de atención al cliente</strong
          >.
        </p>
      </section>
    </main>
  `,
})
export default class Gone {}
