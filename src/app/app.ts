import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CartDrawerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);

  isDashboardRoute = signal(this.isDashboardUrl(this.router.url));

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects || event.url;
        this.isDashboardRoute.set(this.isDashboardUrl(url));
      }
    });
  }

  private isDashboardUrl(url: string): boolean {
    return url.startsWith('/admin') || url.startsWith('/empleado');
  }
}
