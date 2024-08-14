import { Component, inject } from '@angular/core';
import { ActionsService } from '../../services/actions.service';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { ProductsService } from '../../services/products.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss',
})
export class WishlistComponent {
  actionService = inject(ActionsService);
  authService = inject(AuthService);
  productService = inject(ProductsService);
  _router = inject(Router);
  wishlistDetails!: any;
  destoryRef$ = new Subject<boolean>();
  loggedUserId: string = this.authService.loggedUserId;

  ngOnInit() {
    if (this.authService.isLoggedIn) this.loadWishlistItems();
  }

  loadWishlistItems() {
    this.actionService
      .getWishlistItems(this.loggedUserId)
      .pipe(takeUntil(this.destoryRef$))
      .subscribe({
        next: (list) => {
          this.wishlistDetails = this.formatWishlistDetails(list['data']);
        },
      });
  }

  formatWishlistDetails(wishlist: any) {
    let totalAmount = 0;
    const wishlistDetails = wishlist.map((item: any) => {
      let stocks = item.itemId.availabilityStocks[0];
      item.mrpPrice = stocks.mrpPrice;
      item.discount = stocks.discount;
      item.salePrice = this.productService.calculatePrice(
        stocks.mrpPrice,
        stocks.discount
      ).price;
      item.totalPrice = (item.salePrice * item.quantity).toFixed(2);
      totalAmount += item.salePrice * item.quantity;
      return item;
    });
    return wishlistDetails;
  }

  deleteWishlist(listId: string) {
    const payload = {
      id: listId,
      details: {
        isDeleted: true,
      },
    };
    this.actionService
      .removemarkWishlist(payload)
      .pipe(takeUntil(this.destoryRef$))
      .subscribe({
        next: (list) => {
          this.actionService.decreaseWishlist();
          this.loadWishlistItems();
        },
        error: (err) => {},
      });
  }

  redirectToProductDetails(productName: string, productId: string) {
    console.log('product', productName, productId);
    this._router.navigate(['store/products', productName], {
      queryParams: { pid: productId },
    });
  }

  ngOnDestroy() {
    this.destoryRef$.next(true);
    this.destoryRef$.unsubscribe();
  }
}
