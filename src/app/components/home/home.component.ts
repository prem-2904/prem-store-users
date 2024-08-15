import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
} from '@angular/core';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ProductsService } from '../../services/products.service';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { AdsComponent } from '../../shared/ads/ads.component';
import { ActionsService } from '../../services/actions.service';
import { AuthService } from '../../services/auth.service';
import { IProducts } from '../../utils/products';
import { ToastService } from '../../services/toast.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SlickCarouselModule, ProductCardComponent, AdsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  productService = inject(ProductsService);
  actionService = inject(ActionsService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  _cd = inject(ChangeDetectorRef);
  destory$: Subject<boolean> = new Subject<boolean>();
  products: any = [];
  productSignal = signal<IProducts[]>([]);
  cartData: any = [];
  wishlistData: any = [];

  ngOnInit() {
    // this.getListOfProducts();
    this.getAllProducts();
  }

  getListOfProducts() {
    this.productService
      .getListOfProducts()
      .pipe(takeUntil(this.destory$))
      .subscribe({
        next: (prd: any) => {
          this.products = prd['data'];
          prd['data'].map((product: any) => {
            product['sellerName'] = product['sellerId']['sellerName'];
            product['mrpPrice'] = product['availabilityStocks'][0]?.mrpPrice;
            product['discount'] = product['availabilityStocks'][0]?.discount;
            product['salePrice'] = this.productService.calculatePrice(
              product['mrpPrice'],
              product['discount']
            ).price;
          });
          console.log('products', this.products);
        },
        error: (err: any) => {},
      });
  }

  getAllProducts() {
    let productApi$: any, cartApi$: any, wishlistApi$: any;
    productApi$ = this.productService.getListOfProducts();
    if (this.authService.isLoggedIn) {
      cartApi$ = this.actionService.getCartItems(this.authService.loggedUserId);
      wishlistApi$ = this.actionService.getWishlistItems(
        this.authService.loggedUserId
      );
      this.loadAllDetails({ productApi$, cartApi$, wishlistApi$ });
    } else {
      this.loadAllDetails({ productApi$ });
    }
  }

  loadAllDetails(apiCalls: any) {
    combineLatest(apiCalls)
      .pipe(takeUntil(this.destory$))
      .subscribe({
        next: (results: any) => {
          console.log('results', results);
          const productApiData = results['productApi$']?.['data'];
          this.cartData = results?.['cartApi$']?.['data'];
          this.wishlistData = results?.['wishlistApi$']?.['data'];

          if (productApiData && productApiData.length) {
            this.products = productApiData.map((product: any) => {
              if (this.cartData && this.cartData.length) {
                var cartId = this.isItemAddedToCart(product._id).cartId;
                if (cartId) {
                  product['isAddedtoCart'] = true;
                  product['cartId'] = cartId;
                }
              }
              if (this.wishlistData && this.wishlistData.length) {
                var wishListId = this.isItemMarkedToWishlist(
                  product._id
                ).wishlistId;
                if (wishListId) {
                  product['isWishlisted'] = true;
                  product['wishlistId'] = wishListId;
                }
              }

              product['sellerName'] = product['sellerId']['sellerName'];
              product['mrpPrice'] = product['availabilityStocks'][0]?.mrpPrice;
              product['discount'] = product['availabilityStocks'][0]?.discount;
              product['salePrice'] = this.productService.calculatePrice(
                product['mrpPrice'],
                product['discount']
              ).price;

              return product;
            });

            this.productSignal.set(this.products);

            console.log('product-updated', this.products);
          }
        },
      });
  }

  isItemAddedToCart(productId: string) {
    let isAddedToCart = this.cartData.findIndex((cart: any) => {
      return cart.itemId._id === productId;
    });
    const cartId =
      isAddedToCart != -1 ? { cartId: this.cartData[isAddedToCart]._id } : {};
    return cartId;
  }

  isItemMarkedToWishlist(productId: string) {
    let isWishListed = this.wishlistData.findIndex(
      (list: any) => list.itemId._id === productId
    );
    const listId =
      isWishListed != -1
        ? { wishlistId: this.wishlistData[isWishListed]._id }
        : {};
    return listId;
  }

  calculatePrice(amount: number, discount: number) {
    let discountedRate = (amount / 100) * discount;
    return amount - discountedRate;
  }

  cartAction(cart: any) {
    if (cart.cartId) {
      this.removeCart(cart.cartId, cart.productId);
    } else {
      this.addToCart(cart.productId);
    }
  }

  addToCart(productId: string) {
    const payload = {
      userId: this.authService.loggedUserId,
      itemId: productId,
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
          const productIdx = this.getProductIdx(productId);
          this.products[productIdx]['cartId'] = cart['data'];
          this.products[productIdx]['isAddedtoCart'] = true;
          this.toastService.showSuccess(cart?.message);
          console.log(this.products[productIdx]);
        },
        error: (err) => {
          console.log('error on add to cart', err);
          this.toastService.showError(err?.message);
        },
      });
  }

  removeCart(cartId: string, productId: string) {
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
          const productIdx = this.getProductIdx(productId);
          this.products[productIdx]['cartId'] = null;
          this.products[productIdx]['isAddedtoCart'] = false;
          this.toastService.showSuccess(cart?.message);
          console.log(this.products[productIdx]);
        },
        error: (err) => {
          this.toastService.showError(err?.message);
          console.log('error on add to cart', err);
        },
      });
  }

  wishlistAction(list: any) {
    if (list?.listId) {
      this.removeWishlist(list.listId, list.rowI);
    } else {
      this.addWishlist(list.productId, list.rowI);
    }
  }

  addWishlist(productId: string, row: number) {
    const payload = {
      userId: this.authService.loggedUserId,
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
          const productIdx = this.getProductIdx(productId);
          this.products[productIdx]['wishlistId'] = result.data;
          this.products[productIdx]['isWishlisted'] = true;
          this.toastService.showSuccess('Added to wishlist!');
          console.log(this.products[productIdx]);
        },
        error: (err) => {
          this.toastService.showError(err.message);
        },
      });
  }

  removeWishlist(listId: string, productId: string) {
    const payload = {
      id: listId,
      details: {
        isDeleted: true,
      },
    };
    this.actionService
      .markWishlist(payload)
      .pipe(takeUntil(this.destory$))
      .subscribe({
        next: (result: any) => {
          this.actionService.decreaseWishlist();
          const productIdx = this.getProductIdx(productId);
          this.products[productIdx]['wishlistId'] = null;
          this.products[productIdx]['isWishlisted'] = false;
          this.toastService.showSuccess('Removed from Cart!');
          console.log(this.products[productIdx]);
        },
        error: (err) => {
          this.toastService.showError(err.message);
        },
      });
  }

  getProductIdx(pid: string) {
    const pIdx = this.products.findIndex((d: IProducts) => d._id === pid);
    console.log('pIdx', pIdx);
    return pIdx;
  }

  ngOnDestory() {
    this.destory$.next(true);
    this.destory$.unsubscribe();
  }
}
