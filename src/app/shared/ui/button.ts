import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ButtonVariant = 'outline' | 'ghost';

const BASE_CLASSES = 'inline-flex cursor-pointer items-center justify-center transition-colors';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  outline:
    'rounded-full border border-primary-main px-4 py-3 text-base/6 font-semibold text-primary-main hover:border-primary-dark hover:bg-primary-light hover:text-primary-dark',
  ghost:
    'gap-2 rounded-full px-4 py-2 text-base text-text-secondary hover:bg-neutral-background',
};

/** Botón de marca. Todo tratamiento visual nuevo se agrega como variante. */
@Component({
  selector: 'button[ui-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: `<ng-content />`,
})
export class Button {
  readonly variant = input<ButtonVariant>('outline');

  protected readonly classes = computed(() => `${BASE_CLASSES} ${VARIANT_CLASSES[this.variant()]}`);
}
