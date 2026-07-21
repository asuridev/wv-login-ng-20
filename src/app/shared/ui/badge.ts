import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Etiqueta corta sobre superficies de marca (ej. categoría de una card). */
@Component({
  selector: 'ui-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'inline-flex items-center justify-center rounded-badge border border-neutral-border bg-neutral-light px-badge-x py-badge-y text-sm/5 font-normal text-neutral-medium',
  },
  template: `<ng-content />`,
})
export class Badge {}
