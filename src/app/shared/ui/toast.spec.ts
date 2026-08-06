import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastVariant } from '../../core/store/toast.store';
import { Toast } from './toast';

describe('Toast', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toast],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  function createComponent(variant: ToastVariant = 'error'): ComponentFixture<Toast> {
    const fixture = TestBed.createComponent(Toast);
    fixture.componentRef.setInput('variant', variant);
    fixture.componentRef.setInput('title', 'Ocurrió un error');
    fixture.componentRef.setInput('message', 'No fue posible iniciar el flujo de venta.');
    fixture.detectChanges();
    return fixture;
  }

  it('renderiza el título y el mensaje', () => {
    const compiled = createComponent().nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Ocurrió un error');
    expect(compiled.textContent).toContain('No fue posible iniciar el flujo de venta.');
  });

  it('anuncia los errores de forma asertiva', () => {
    const host = createComponent('error').nativeElement as HTMLElement;

    expect(host.getAttribute('role')).toBe('alert');
    expect(host.getAttribute('aria-live')).toBe('assertive');
    expect(host.className).toContain('border-status-error');
  });

  it('anuncia el resto de variantes de forma cortés', () => {
    const host = createComponent('info').nativeElement as HTMLElement;

    expect(host.getAttribute('role')).toBe('status');
    expect(host.getAttribute('aria-live')).toBe('polite');
    expect(host.className).toContain('border-status-info');
  });

  it('emite closed al pulsar el botón de cerrar', () => {
    const fixture = createComponent();
    const closed = jasmine.createSpy('closed');
    fixture.componentInstance.closed.subscribe(closed);

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.getAttribute('aria-label')).toBe('Cerrar notificación');
    button?.click();

    expect(closed).toHaveBeenCalled();
  });
});
