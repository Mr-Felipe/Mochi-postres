import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class PaletteService {
  private platformId = inject(PLATFORM_ID);
  readonly current = signal<'vino'>('vino');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-palette', 'vino');
    }
  }
}
