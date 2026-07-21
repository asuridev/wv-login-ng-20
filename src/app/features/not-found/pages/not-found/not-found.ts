import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  template: `
    <div class="flex min-h-dvh flex-col justify-between bg-neutral-surface">
      <header class="flex items-center border-b border-neutral-divider px-8 py-5">
        <img
          ngSrc="/assets/logos/seguros-alfa-logo.svg"
          width="139"
          height="24"
          alt="Seguros Alfa"
        />
      </header>

      <main class="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <p class="text-8xl font-bold leading-none text-neutral-medium md:text-9xl" aria-hidden="true">
          404
        </p>
        <h1 class="mt-6 text-xxl font-bold text-text-primary md:text-xxxl">Página no encontrada</h1>
        <p class="mx-auto mt-2 max-w-sm text-base text-text-secondary">
          La página que buscas no existe o fue movida a otra dirección.
        </p>
      </main>

      <footer class="flex justify-center border-t border-neutral-divider px-8 py-5">
        <p class="text-xs text-text-hint">© {{ year }} BNP Paribas Cardif Colombia</p>
      </footer>
    </div>
  `,
})
export default class NotFound {
  protected readonly year = new Date().getFullYear();
}
