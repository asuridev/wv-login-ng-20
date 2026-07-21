import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';

import { RedirectService } from '../../../core/services/redirect';
import { PartnerStore } from '../../../core/store/partner.store';
import { MasheryQueries } from '../queries/mashery-queries';
import { HomeCard } from './home-card';

describe('HomeCard', () => {
  let redirectServiceSpy: jasmine.SpyObj<RedirectService>;
  let mutationFn: jasmine.Spy;
  let partnerStore: InstanceType<typeof PartnerStore>;

  beforeEach(async () => {
    redirectServiceSpy = jasmine.createSpyObj('RedirectService', ['redirectTo']);
    redirectServiceSpy.redirectTo.and.resolveTo();
    mutationFn = jasmine.createSpy('mutationFn').and.resolveTo({});

    await TestBed.configureTestingModule({
      imports: [HomeCard],
      providers: [
        provideZonelessChangeDetection(),
        provideTanStackQuery(new QueryClient()),
        { provide: RedirectService, useValue: redirectServiceSpy },
        {
          provide: MasheryQueries,
          useValue: { sendSaleCompleted: () => ({ mutationFn }) },
        },
      ],
    }).compileComponents();

    partnerStore = TestBed.inject(PartnerStore);
    partnerStore.setPartner('occidente');
  });

  function createComponent(productType?: number): ComponentFixture<HomeCard> {
    const fixture = TestBed.createComponent(HomeCard);
    fixture.componentRef.setInput('title', 'Seguro Tradicional');
    fixture.componentRef.setInput('labelButton', 'Ver ahora');
    fixture.componentRef.setInput('labelBadge', 'A tu medida');
    fixture.componentRef.setInput('redirectTo', 'https://webview.test');
    if (productType !== undefined) {
      fixture.componentRef.setInput('productType', productType);
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

  it('registra la venta, fija el productType y redirige al webview del partner', async () => {
    const fixture = createComponent(1);

    fixture.componentInstance.onClick();
    await fixture.whenStable();

    expect(mutationFn).toHaveBeenCalled();
    expect(partnerStore.productType()).toBe(1);
    expect(redirectServiceSpy.redirectTo).toHaveBeenCalledWith(
      'https://webview.test/wv_occidente',
      '/home'
    );
  });

  it('usa productType 0 cuando el input viene sin valor', () => {
    createComponent().componentInstance.onClick();

    expect(partnerStore.productType()).toBe(0);
  });
});
