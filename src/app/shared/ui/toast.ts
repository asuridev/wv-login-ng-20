import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { ToastVariant } from '../../core/store/toast.store';

const BASE_CLASSES =
  'pointer-events-auto flex w-full max-w-toast items-start gap-3 rounded-card border-l-4 ' +
  'bg-neutral-surface px-4 py-3 shadow-lg';

/**
 * El acento va en el borde/icono y no en el fondo: `--color-status-*` lo
 * sobrescribe `ThemeApplier` por partner, así que un fondo sólido daría
 * contrastes distintos según el banco.
 */
const VARIANT_CLASSES: Record<ToastVariant, string> = {
  error: 'border-status-error',
  success: 'border-status-success',
  info: 'border-status-info',
};

const ICON_BASE_CLASSES = 'mt-0.5 h-5 w-5 shrink-0';

const ICON_VARIANT_CLASSES: Record<ToastVariant, string> = {
  error: 'text-status-error',
  success: 'text-status-success',
  info: 'text-status-info',
};

/** Notificación efímera. Todo tratamiento visual nuevo se agrega como variante. */
@Component({
  selector: 'ui-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'role()',
    '[attr.aria-live]': 'ariaLive()',
    'aria-atomic': 'true',
  },
  template: `
    <svg
      [class]="iconClasses()"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm.75 4.25a.75.75 0 0 0-1.5 0v5a.75.75 0 0 0 1.5 0v-5ZM10 13.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
        clip-rule="evenodd"
      />
    </svg>

    <div class="flex-1">
      @if (title()) {
        <p class="text-base font-semibold text-text-primary">{{ title() }}</p>
      }
      @if (message()) {
        <p class="text-sm text-text-secondary">{{ message() }}</p>
      }
    </div>

    <button
      type="button"
      class="-mr-1 shrink-0 cursor-pointer rounded-badge p-1 text-text-hint transition-colors hover:bg-neutral-background hover:text-text-primary"
      aria-label="Cerrar notificación"
      (click)="closed.emit()"
    >
      <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
        />
      </svg>
    </button>
  `,
})
export class Toast {
  readonly variant = input<ToastVariant>('error');
  readonly title = input('');
  readonly message = input('');

  readonly closed = output<void>();

  protected readonly classes = computed(() => `${BASE_CLASSES} ${VARIANT_CLASSES[this.variant()]}`);
  protected readonly iconClasses = computed(
    () => `${ICON_BASE_CLASSES} ${ICON_VARIANT_CLASSES[this.variant()]}`
  );

  protected readonly role = computed(() => (this.variant() === 'error' ? 'alert' : 'status'));
  protected readonly ariaLive = computed(() =>
    this.variant() === 'error' ? 'assertive' : 'polite'
  );
}
