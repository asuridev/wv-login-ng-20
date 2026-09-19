import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  CardFlow,
  CardFlowContext,
  CardFlowName,
  DEFAULT_CARD_FLOW,
} from '../../../core/models/card-flow-model';
import { TEST_PARTNER } from '../../../core/config/partners-test-support';
import { PartnerStore } from '../../../core/store/partner.store';
import { ToastStore } from '../../../core/store/toast.store';
import { CardFlowResolver } from '../flows/card-flow-resolver';
import { HomeCard } from './home-card';

/**
 * El componente ya no conoce los pasos de ningún flujo: solo delega en el que
 * declara la card. Por eso aquí se mockea el resolver y se prueba la
 * delegación, el estado del botón y la respuesta visual al error — la mecánica
 * de cada flujo se prueba en `flows/*.spec.ts`.
 */
describe('HomeCard', () => {
  let flowSpy: jasmine.SpyObj<CardFlow>;
  let resolverSpy: jasmine.SpyObj<CardFlowResolver>;
  let partnerStore: InstanceType<typeof PartnerStore>;
  let toastStore: InstanceType<typeof ToastStore>;

  beforeEach(async () => {
    flowSpy = jasmine.createSpyObj('CardFlow', ['run']);
    flowSpy.run.and.resolveTo();
    resolverSpy = jasmine.createSpyObj('CardFlowResolver', ['resolve']);
    resolverSpy.resolve.and.returnValue(flowSpy);

    await TestBed.configureTestingModule({
      imports: [HomeCard],
      providers: [
        provideZonelessChangeDetection(),
        { provide: CardFlowResolver, useValue: resolverSpy },
      ],
    }).compileComponents();

    partnerStore = TestBed.inject(PartnerStore);
    partnerStore.setPartner(TEST_PARTNER);

    toastStore = TestBed.inject(ToastStore);
    toastStore.clear();
  });

  function createComponent(
    productType?: number,
    flow?: CardFlowName
  ): ComponentFixture<HomeCard> {
    const fixture = TestBed.createComponent(HomeCard);
    fixture.componentRef.setInput('title', 'Seguro Tradicional');
    fixture.componentRef.setInput('labelButton', 'Ver ahora');
    fixture.componentRef.setInput('labelBadge', 'A tu medida');
    fixture.componentRef.setInput('redirectTo', 'https://webview.test');
    if (productType !== undefined) {
      fixture.componentRef.setInput('productType', productType);
    }
    if (flow !== undefined) {
      fixture.componentRef.setInput('flow', flow);
    }
    fixture.detectChanges();
    return fixture;
  }

  it('renderiza título, badge y label del botón', () => {
    const compiled = createComponent(1).nativeElement as HTMLElement;

    expect(compiled.querySelector('h5')?.textContent).toContain('Seguro Tradicional');
    expect(compiled.querySelector('ui-badge')?.textContent).toContain('A tu medida');
    expect(compiled.querySelector('button')?.textContent).toContain('Ver ahora');
  });

  it('ejecuta el flujo declarado por la card con el contexto de la card', async () => {
    const fixture = createComponent(5, 'commercial');

    await fixture.componentInstance.onClick();

    expect(resolverSpy.resolve).toHaveBeenCalledWith('commercial');
    expect(flowSpy.run).toHaveBeenCalledWith({
      url: 'https://webview.test',
      productType: 5,
      partnerId: TEST_PARTNER,
    } satisfies CardFlowContext);
  });

  it('usa el flujo por defecto cuando la card no declara uno', async () => {
    const fixture = createComponent(1);

    await fixture.componentInstance.onClick();

    expect(resolverSpy.resolve).toHaveBeenCalledWith(DEFAULT_CARD_FLOW);
  });

  it('usa productType 0 cuando el input viene sin valor', async () => {
    const fixture = createComponent();

    await fixture.componentInstance.onClick();

    expect(flowSpy.run).toHaveBeenCalledWith(jasmine.objectContaining({ productType: 0 }));
  });

  it('avisa con un toast de error cuando el flujo falla', async () => {
    flowSpy.run.and.rejectWith(new Error('boom'));
    const fixture = createComponent(1);

    await fixture.componentInstance.onClick();

    expect(toastStore.toasts().length).toBe(1);
    expect(toastStore.toasts()[0]).toEqual(
      jasmine.objectContaining({
        variant: 'error',
        title: 'Ocurrió un error',
        message: 'No fue posible continuar. Intenta nuevamente.',
      })
    );
  });

  it('no muestra ningún toast cuando el flujo se ejecuta bien', async () => {
    const fixture = createComponent(1);

    await fixture.componentInstance.onClick();

    expect(toastStore.toasts()).toEqual([]);
  });

  it('ignora clicks adicionales mientras el flujo está en curso', async () => {
    const fixture = createComponent(1);

    await Promise.all([fixture.componentInstance.onClick(), fixture.componentInstance.onClick()]);

    expect(flowSpy.run).toHaveBeenCalledTimes(1);
  });

  it('rehabilita el botón después de un fallo para permitir reintentar', async () => {
    flowSpy.run.and.rejectWith(new Error('boom'));
    const fixture = createComponent(1);

    await fixture.componentInstance.onClick();
    await fixture.componentInstance.onClick();

    expect(flowSpy.run).toHaveBeenCalledTimes(2);
  });
});
