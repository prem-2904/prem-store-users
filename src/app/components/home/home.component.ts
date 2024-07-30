import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ProductsService } from '../../services/products.service';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { AdsComponent } from '../../shared/ads/ads.component';
import { ActionsService } from '../../services/actions.service';
import { AuthService } from '../../services/auth.service';
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
  _cd = inject(ChangeDetectorRef);
  destory$: Subject<boolean> = new Subject<boolean>();
  products: any = [];
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
      this.removeCart(cart.cartId, cart.rowI);
    } else {
      this.addToCart(cart.productId, cart.rowI);
    }
  }

  addToCart(productId: string, row: number) {
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
          this.products[row]['cartId'] = cart['data'];
          this.products[row]['isAddedtoCart'] = true;
          this._cd.detectChanges();
        },
        error: (err) => {
          console.log('error on add to cart', err);
        },
      });
  }

  removeCart(cartId: string, row: number) {
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
          this.products[row]['cartId'] = null;
          this.products[row]['isAddedtoCart'] = false;
          this._cd.detectChanges();
        },
        error: (err) => {
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
          this.products[row]['wishlistId'] = result.data;
          this.products[row]['isWishlisted'] = true;
          this._cd.detectChanges();
          // this.notificationService.success(result.message, 'Success');
        },
        error: (err) => {
          // this.notificationService.error(err.message, 'Failed');
        },
      });
  }

  removeWishlist(listId: string, row: number) {
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
          this.products[row]['wishlistId'] = null;
          this.products[row]['isWishlisted'] = false;
          this._cd.detectChanges();
          // this.notificationService.success(result.message, 'Success');
        },
        error: (err) => {
          // this.notificationService.error(err.message, 'Failed');
        },
      });
  }

  ngOnDestory() {
    this.destory$.next(true);
    this.destory$.unsubscribe();
  }
}
