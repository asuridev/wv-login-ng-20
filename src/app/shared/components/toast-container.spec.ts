import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastStore } from '../../core/store/toast.store';
import { TOAST_TIMEOUT_MS, ToastContainer } from './toast-container';

describe('ToastContainer', () => {
  let fixture: ComponentFixture<ToastContainer>;
  let toastStore: InstanceType<typeof ToastStore>;

  beforeEach(async () => {
    jasmine.clock().install();

    await TestBed.configureTestingModule({
      imports: [ToastContainer],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    toastStore = TestBed.inject(ToastStore);
    fixture = TestBed.createComponent(ToastContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    toastStore.clear();
    jasmine.clock().uninstall();
  });

  function toasts(): NodeListOf<Element> {
    return (fixture.nativeElement as HTMLElement).querySelectorAll('ui-toast');
  }

  it('no renderiza nada cuando la cola está vacía', () => {
    expect(toasts().length).toBe(0);
  });

  it('renderiza un ui-toast por cada notificación del store', async () => {
    toastStore.error('Ocurrió un error', 'No fue posible iniciar el flujo de venta.');
    toastStore.info('Aviso', 'Segundo mensaje');
    await fixture.whenStable();

    expect(toasts().length).toBe(2);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No fue posible iniciar el flujo de venta.'
    );
  });

  it('auto-cierra el toast al cumplirse el timeout', async () => {
    toastStore.error('Ocurrió un error', '');
    await fixture.whenStable();
    expect(toasts().length).toBe(1);

    jasmine.clock().tick(TOAST_TIMEOUT_MS);
    await fixture.whenStable();

    expect(toastStore.toasts()).toEqual([]);
    expect(toasts().length).toBe(0);
  });

  it('cierra el toast al pulsar su botón de cerrar', async () => {
    toastStore.error('Ocurrió un error', '');
    await fixture.whenStable();

    (fixture.nativeElement as HTMLElement).querySelector('ui-toast button')?.dispatchEvent(
      new MouseEvent('click')
    );
    await fixture.whenStable();

    expect(toastStore.toasts()).toEqual([]);
  });

  it('cancela los timers pendientes al destruirse', async () => {
    toastStore.error('Ocurrió un error', '');
    await fixture.whenStable();

    fixture.destroy();
    jasmine.clock().tick(TOAST_TIMEOUT_MS);

    // El store queda intacto: nadie descarta nada después de destruir la vista.
    expect(toastStore.toasts().length).toBe(1);
  });
});
