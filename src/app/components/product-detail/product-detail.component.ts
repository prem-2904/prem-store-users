import { AsyncPipe, CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  Signal,
  inject,
  signal,
} from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { Subject, of, takeUntil } from 'rxjs';
import { AvailabilityStock, IProducts } from '../../utils/products';
import { ActionsService } from '../../services/actions.service';
import { AuthService } from '../../services/auth.service';
import { BreadcrumbsComponent } from '../../shared/breadcrumbs/breadcrumbs.component';
import { MenuItem } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, AsyncPipe, BreadcrumbsComponent, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent {
  @Input() pid!: string;
  @Input() name!: string;
  productService = inject(ProductsService);
  actionService = inject(ActionsService);
  toastService = inject(ToastService);
  _cd = inject(ChangeDetectorRef);
  destory$ = new Subject<boolean>();
  openTab = 1;
  productDetails!: IProducts;
  displayImg!: string;
  loggedUserId: string = inject(AuthService).loggedUserId;
  isItemActions: any;
  wishlist$: any;
  breadcrumbsData: MenuItem[] | undefined;
  isWishlisted = signal(false);
  isAddedToCart = signal(false);
  ngOnInit() {
    this.loadProductDetails();
    this.loadCart(this.pid);
    this.breadcrumbsData = [
      { icon: 'pi pi-home', route: '/store' },
      { label: 'Products', route: '/store' },
      {
        label: this.name,
        route: `/store/products/${this.name}`,
        queryParams: [{ pid: this.pid }],
      },
    ];
  }

  loadProductDetails() {
    this.productService
      .getProductDetails(this.pid)
      .pipe(takeUntil(this.destory$))
      .subscribe({
        next: (details: any) => {
          this.productDetails = this.loadAvailabilityDetails(
            details['data']?.[0]
          );
          this.displayImg = this.productDetails?.productImages?.[0];
        },
        error: (err: any) => {
          this.toastService.showError(err.message);
        },
      });
  }

  loadAvailabilityDetails(product: IProducts) {
    if (product.availabilityStocks && product.availabilityStocks.length) {
      const availabilityStocks = product.availabilityStocks[0];
      product['mrpPrice'] = product.availabilityStocks[0].mrpPrice;
      product['discount'] = product.availabilityStocks[0].discount;
      product['salePrice'] = this.productService.calculatePrice(
        product['mrpPrice'],
        product['discount']
      ).price;

      if (availabilityStocks.addedStockNos <= 0) {
        product['outOfStock'] = true;
      }
    }

    return product;
  }

  loadCart(productId: string) {
    this.actionService
      .isItemWishlistCart(this.loggedUserId, productId)
      .pipe(takeUntil(this.destory$))
      .subscribe({
        next: (cart: any) => {
          console.log('cart', cart.data);
          this.isAddedToCart.set(cart?.data?.isAddedToCart);
          this.isWishlisted.set(cart?.data?.isWishlisted);
        },
        error: (err) => {
          this.toastService.showError(err.message);
        },
      });
  }

  addToCart(pid: string) {
    const payload = {
      userId: this.loggedUserId,
      itemId: pid,
      addedToCart: true,
      isDeleted: false,
    };
    this.actionService
      .addToCart(payload)
      .pipe(takeUntil(this.destory$))
      .subscribe({
        next: (cart) => {
          console.log('Added to cart', cart['data']);
          this.actionService.increaseAddToCart();
          this.productDetails.isAddedtoCart = true;
          this.productDetails.cartId = cart.data['cartId'];
          this._cd.detectChanges();
          this.toastService.showSuccess(cart.message);
        },
        error: (err) => {
          this.toastService.showError(err.message);
        },
      });
  }

  removeCart(cartId: string) {
    const payload = {
      id: cartId,
      details: {
        isDeleted: true,
      },
    };
    this.actionService
      .removeFromCart(payload)
      .pipe(takeUntil(this.destory$))
      .subscribe({
        next: (cart) => {
          console.log('Added to cart', cart['data']);
          this.actionService.decreaseAddToCart();
          this.productDetails.cartId = undefined;
          this.productDetails.isAddedtoCart = false;
          this._cd.detectChanges();
          this.toastService.showSuccess(cart.message);
        },
        error: (err) => {
          this.toastService.showError(err.message);
        },
      });
  }

  addWishlist(productId: string) {
    const payload = {
      userId: this.loggedUserId,
      itemId: productId,
      markedFav: true,
      isDeleted: false,
    };
    this.actionService
      .markWishlist(payload)
      .pipe(takeUntil(this.destory$))
      .subscribe({
        next: (result: any) => {
          this.actionService.increaseWishlist();
          this.productDetails.wishlistId = result.data;
          this.productDetails.isWishlisted = true;
          this._cd.detectChanges();
          this.toastService.showSuccess(result.message);
        },
        error: (err) => {
          this.toastService.showError(err.message);
        },
      });
  }

  removeWishlist(listId: string) {
    const payload = {
      id: listId,
      details: {
        isDeleted: true,
      },
    };
    this.actionService
      .removemarkWishlist(payload)
      .pipe(takeUntil(this.destory$))
      .subscribe({
        next: (result: any) => {
          this.actionService.decreaseWishlist();
          this.productDetails.wishlistId = undefined;
          this.productDetails.isWishlisted = false;
          this.isWishlisted.set(false);
          this._cd.detectChanges();
          this.toastService.showSuccess(result.message);
        },
        error: (err) => {
          this.toastService.showError(err.message);
        },
      });
  }

  loadWishlist() {}

  toggleTabs($tabNumber: number) {
    this.openTab = $tabNumber;
  }

  ngOnDestory() {
    this.destory$.next(true);
    this.destory$.unsubscribe();
  }
}
