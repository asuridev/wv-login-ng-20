import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { PartnerStore } from '../../../core/store/partner.store';
import { HomeFooter } from './home-footer';

describe('HomeFooter', () => {
  let partnerStore: InstanceType<typeof PartnerStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeFooter],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    partnerStore = TestBed.inject(PartnerStore);
  });

  it('no renderiza logos mientras no haya partner resuelto', () => {
    const fixture = TestBed.createComponent(HomeFooter);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('img').length).toBe(0);
  });

  it('renderiza los logos del partner activo', () => {
    partnerStore.setPartner('occidente');

    const fixture = TestBed.createComponent(HomeFooter);
    fixture.detectChanges();

    const sources = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('img')
    ).map((img) => img.getAttribute('src'));

    expect(sources.length).toBe(4);
    expect(sources).toContain('/assets/logos/logo-vigilado.svg');
    expect(sources).toContain('/assets/logos/banco-occidente-logo.svg');
    expect(sources).toContain('/assets/logos/grupo-aval-logo.svg');
    expect(sources).toContain('/assets/logos/seguros-alfa-logo.svg');
  });
});
