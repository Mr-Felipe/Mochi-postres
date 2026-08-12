import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomePageComponent)
  },
  {
    path: 'productos',
    loadComponent: () => import('./pages/catalog/catalog').then(m => m.CatalogPageComponent)
  },
  {
    path: 'productos/:id',
    loadComponent: () => import('./pages/catalog/product-detail/product-detail').then(m => m.ProductDetailPageComponent)
  },
  {
    path: 'sobre-nosotros',
    loadComponent: () => import('./pages/about/about').then(m => m.AboutPageComponent)
  },
  {
    path: 'simulador',
    loadComponent: () => import('./pages/simulator/simulator').then(m => m.SimulatorPageComponent)
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/cart/cart').then(m => m.CartPageComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout').then(m => m.CheckoutPageComponent)
  },
  {
    path: 'pedidos',
    loadComponent: () => import('./pages/orders/orders').then(m => m.OrdersPageComponent)
  },
  {
    path: 'empleado',
    loadComponent: () => import('./pages/pos-employee/pos-employee').then(m => m.PosEmployeePageComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-dashboard').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog').then(m => m.BlogPageComponent)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contact/contact').then(m => m.ContactPageComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
