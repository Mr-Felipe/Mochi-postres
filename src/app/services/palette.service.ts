import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type PaletteType = 'clara' | 'vino';

@Injectable({ providedIn: 'root' })
export class PaletteService {
  private platformId = inject(PLATFORM_ID);
  readonly current = signal<PaletteType>('clara');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('mochi-palette') as PaletteType | null;
      if (saved === 'clara' || saved === 'vino') {
        this.current.set(saved);
        document.documentElement.setAttribute('data-palette', saved);
      } else {
        document.documentElement.setAttribute('data-palette', 'clara');
      }

      effect(() => {
        const palette = this.current();
        document.documentElement.setAttribute('data-palette', palette);
        localStorage.setItem('mochi-palette', palette);
      });
    }
  }

  toggle() {
    this.current.update(p => p === 'clara' ? 'vino' : 'clara');
  }

  set(palette: PaletteType) {
    this.current.set(palette);
  }
}
