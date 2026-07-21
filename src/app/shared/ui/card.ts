import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Superficie de contenido con el tratamiento de marca del partner. */
@Component({
  selector: 'ui-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'block w-card max-w-card h-card-h overflow-hidden rounded-card border border-neutral-border bg-neutral-surface',
  },
  template: `<ng-content />`,
})
export class Card {}
