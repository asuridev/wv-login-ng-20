import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import Gone from './gone';

describe('Gone', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gone],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('se crea', () => {
    const fixture = TestBed.createComponent(Gone);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('anuncia el mensaje como encabezado principal', () => {
    const fixture = TestBed.createComponent(Gone);
    fixture.detectChanges();

    const heading = (fixture.nativeElement as HTMLElement).querySelector('h1');
    expect(heading?.textContent?.trim()).toBe('Esta página ya no está disponible');
  });

  it('remite a la entidad, no al banco', () => {
    const fixture = TestBed.createComponent(Gone);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('comunícate con tu entidad');
    expect(text).not.toContain('banco');
  });

  it('no ofrece acciones al usuario', () => {
    const fixture = TestBed.createComponent(Gone);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('button, a').length).toBe(0);
  });
});
