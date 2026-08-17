import { Routes } from '@angular/router';
import { authGuard, adminGuard, empleadoGuard } from './guards/auth.guard';

export const routes: Routes = [
  // ========================
  // RUTAS PUBLICAS (navbar + footer)
  // ========================
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomePageComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'iniciar-sesion',
    redirectTo: 'login'
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/auth/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'crear-cuenta',
    redirectTo: 'registro'
  },
  {
    path: 'recuperar',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent)
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
    loadComponent: () => import('./pages/checkout/checkout').then(m => m.CheckoutPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pedidos',
    loadComponent: () => import('./pages/orders/orders').then(m => m.OrdersPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cliente/dashboard',
    loadComponent: () => import('./pages/customer/customer-dashboard').then(m => m.CustomerDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog').then(m => m.BlogPageComponent)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contact/contact').then(m => m.ContactPageComponent)
  },

  // ========================
  // DASHBOARD (sidebar layout) — admin y empleado
  // ========================
  {
    path: 'admin',
    loadComponent: () => import('./layouts/dashboard/dashboard-layout').then(m => m.DashboardLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/admin-dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'productos',
        loadComponent: () => import('./pages/admin/admin-dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./pages/admin/admin-dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'detalles',
        loadComponent: () => import('./pages/admin/admin-dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/admin/admin-dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'inventario',
        loadComponent: () => import('./pages/admin/admin-dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'blog',
        loadComponent: () => import('./pages/admin/admin-dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent)
      },
      {
        path: 'diseno',
        loadComponent: () => import('./pages/admin/design-playground/design-playground').then(m => m.DesignPlaygroundComponent)
      },
    ]
  },
  {
    path: 'empleado',
    loadComponent: () => import('./layouts/dashboard/dashboard-layout').then(m => m.DashboardLayoutComponent),
    canActivate: [empleadoGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/pos-employee/pos-employee').then(m => m.PosEmployeePageComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent)
      },
    ]
  },

  // ========================
  // WILDCARD
  // ========================
  {
    path: '**',
    redirectTo: ''
  }
];
