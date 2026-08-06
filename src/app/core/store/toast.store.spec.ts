import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ToastStore } from './toast.store';

describe('ToastStore', () => {
  let store: InstanceType<typeof ToastStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    store = TestBed.inject(ToastStore);
  });

  it('arranca sin notificaciones', () => {
    expect(store.toasts()).toEqual([]);
  });

  it('encola un toast de error con su título y mensaje', () => {
    store.error('Ocurrió un error', 'No fue posible iniciar el flujo de venta.');

    expect(store.toasts().length).toBe(1);
    expect(store.toasts()[0]).toEqual(
      jasmine.objectContaining({
        variant: 'error',
        title: 'Ocurrió un error',
        message: 'No fue posible iniciar el flujo de venta.',
      })
    );
  });

  it('asigna un id distinto a cada toast', () => {
    const first = store.error('A', '');
    const second = store.error('B', '');

    expect(first).not.toBe(second);
    expect(store.toasts().map((toast) => toast.id)).toEqual([first, second]);
  });

  it('descarta únicamente el toast indicado', () => {
    const first = store.error('A', '');
    store.info('B', '');

    store.dismiss(first);

    expect(store.toasts().length).toBe(1);
    expect(store.toasts()[0].title).toBe('B');
  });

  it('no reutiliza ids después de descartar', () => {
    const first = store.error('A', '');
    store.dismiss(first);

    expect(store.error('B', '')).not.toBe(first);
  });

  it('vacía la cola con clear()', () => {
    store.error('A', '');
    store.success('B', '');

    store.clear();

    expect(store.toasts()).toEqual([]);
  });
});
