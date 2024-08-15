import { CommonModule } from '@angular/common';
import { Component, Signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ActionsService } from '../../services/actions.service';
import { AuthService } from '../../services/auth.service';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, MenuModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  productMenu: boolean = false;
  actionService = inject(ActionsService);
  authService = inject(AuthService);
  productService = inject(ProductsService);
  _router = inject(Router);
  totalCart!: number;
  totalWishlist!: number;
  loggedUserProfile!: any;
  isLoggedIn: boolean = false;
  menuItems!: MenuItem[];
  mobileMenuItems!: MenuItem[];
  searchProducts$ = new Subject<string>();
  searchValue!: string;

  ngOnInit() {
    this.loggedUser();
    this.menuItems = [
      {
        label: 'Orders',
        icon: 'pi pi-history',
        routerLink: '/store/orders',
        // items: [
        //   {
        //     label: 'Refresh',
        //     icon: 'pi pi-refresh',
        //   },
        //   {
        //     label: 'Export',
        //     icon: 'pi pi-upload',
        //   },
        // ],
      },
      {
        label: 'Log out',
        icon: 'pi pi-sign-out',
        command: (c) => this.logoutUser(),
      },
    ];

    this.mobileMenuItems = [
      {
        label: 'Signed in as Prem',
      },
      {
        label: 'Cart',
        icon: 'pi pi-shopping-cart',
        routerLink: '/store/cart',
      },
      {
        label: 'Wishlist',
        icon: 'pi pi-heart',
        routerLink: '/store/wishlist',
      },
      {
        label: 'Orders',
        icon: 'pi pi-history',
        routerLink: '/store/orders',
      },
      {
        label: 'Log out',
        icon: 'pi pi-sign-out',
        command: (c) => this.logoutUser(),
      },
    ];
    this.searchDebounce();
  }

  logoutUser() {
    return this.authService.logoutUser().subscribe({
      next: (res: any) => {
        console.log('loggged out!');
        this.authService.clearUserSession();
        this._router.navigate(['auth/login']);
      },
      error: (err: any) => {
        console.log('logout-failed', err);
      },
    });
  }

  searchDebounce() {
    this.searchProducts$
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe({
        next: (search) => {
          console.log('search-key', search);
          this.searchProducts(search);
        },
      });
  }

  loggedUser() {
    const isLoggedIn = this.authService.isLoggedInUser();
    this.isLoggedIn = isLoggedIn;
    const loggedUserDetails = this.authService.loggedUserDetails();
    if (isLoggedIn) {
      this.loggedUserProfile = loggedUserDetails;
      this.loadActions();
    }
  }

  loadActions() {
    this.actionService.getUserCounts(this.loggedUserProfile?._id).subscribe({
      next: (counts) => {
        const userCounts = counts['data'];
        this.actionService.setAddToCart(userCounts['cartCount']);
        this.actionService.setWishlist(userCounts['wishListCount']);
      },
    });
  }

  searchProducts(search: string) {
    this.productService
      .searchProducts(search)
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe({
        next: (search: any) => {
          console.log('search', search);
        },
        error: (err: any) => {
          console.log('Error!!', err.message);
        },
      });
  }
}
