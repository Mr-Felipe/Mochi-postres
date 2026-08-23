import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer';
import { ToastComponent } from './components/toast/toast';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CartDrawerComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);

  isDashboardRoute = signal(this.isDashboardUrl(this.router.url));
  isHomeRoute = signal(this.isHomeUrl(this.router.url));

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects || event.url;
        this.isDashboardRoute.set(this.isDashboardUrl(url));
        this.isHomeRoute.set(this.isHomeUrl(url));
        // Scroll to top on every navigation
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'instant' });
          // Double guarantee after DOM updates
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 50);
        }
      }
    });
  }

  private isDashboardUrl(url: string): boolean {
    return url.startsWith('/admin') || url.startsWith('/empleado');
  }

  private isHomeUrl(url: string): boolean {
    return url === '/' || url === '/inicio';
  }
}
