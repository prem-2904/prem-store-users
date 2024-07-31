import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'store',
    pathMatch: 'full',
  },
  {
    path: 'store',
    loadComponent: () =>
      import('./pages/landing/landing.component').then(
        (l) => l.LandingComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'products',
        title: 'Products',
        loadComponent: () =>
          import('./components/products/products.component').then(
            (p) => p.ProductsComponent
          ),
      },
      {
        path: 'products/:name',
        title: 'Products',
        loadComponent: () =>
          import('./components/product-detail/product-detail.component').then(
            (pd) => pd.ProductDetailComponent
          ),
      },
      {
        path: 'home',
        title: 'Home',
        loadComponent: () =>
          import('./components/home/home.component').then(
            (h) => h.HomeComponent
          ),
      },
      {
        path: 'cart',
        title: 'Cart',
        loadComponent: () =>
          import('./components/cart/cart.component').then(
            (c) => c.CartComponent
          ),
      },
      {
        path: 'wishlist',
        title: 'Wishlist',
        loadComponent: () =>
          import('./components/wishlist/wishlist.component').then(
            (w) => w.WishlistComponent
          ),
      },
      {
        path: 'checkout',
        title: 'Checkout',
        loadComponent: () =>
          import('./components/checkout/checkout.component').then(
            (co) => co.CheckoutComponent
          ),
      },
      {
        path: 'order-summary',
        title: 'Order Summary',
        loadComponent: () =>
          import('./components/order-summary/order-summary.component').then(
            (os) => os.OrderSummaryComponent
          ),
      },
      {
        path: 'orders',
        title: 'Orders',
        loadComponent: () =>
          import('./components/orders/orders.component').then(
            (o) => o.OrdersComponent
          ),
      },
      {
        path: 'order-details',
        title: 'Order details',
        loadComponent: () =>
          import('./components/order-details/order-details.component').then(
            (od) => od.OrderDetailsComponent
          ),
      },
    ],
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login/login.component').then(
            (l) => l.LoginComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/auth/register/register.component').then(
            (r) => r.RegisterComponent
          ),
      },
    ],
  },
];
