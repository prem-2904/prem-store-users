import { Component, inject } from '@angular/core';
import { ActionsService } from '../../services/actions.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ProductsService } from '../../services/products.service';
import { CartDetails, CartProduct } from '../../utils/products';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrdersService } from '../../services/orders.service';
import { OrderItem } from '../../utils/orders';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  actionService = inject(ActionsService);
  productService = inject(ProductsService);
  orderService = inject(OrdersService);
  authService = inject(AuthService);
  _router = inject(Router);
  destroy$ = new Subject<boolean>();
  cartItems: CartProduct[] = [];
  cartDetails!: CartDetails;
  loggedUserId = this.authService.loggedUserId;
  _fb = inject(FormBuilder);
  checkoutForm!: FormGroup;
  ngOnInit() {
    this.loadUserCart();
  }

  initCheckoutForm() {
    this.checkoutForm = this._fb.group({
      fullName: new FormControl('', [Validators.required]),
      adddressLine1: new FormControl('', [Validators.required]),
      adddressLine2: new FormControl(''),
      pincode: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required]),
      typeOfPayment: new FormControl('', [Validators.required]),
    });
  }

  loadUserCart() {
    this.actionService
      .getCartItems(this.loggedUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cart) => {
          this.formatCartDetails(cart['data']);
          console.log('cart-items', this.cartDetails);
        },
        error: (err) => {
          console.log('Error Items', err?.message);
        },
      });
  }

  formatCartDetails(cart: CartProduct[]) {
    let totalAmount = 0;
    const items = cart.map((item: CartProduct) => {
      let stocks = item.itemId.availabilityStocks[0];
      item.sellerId = item.itemId.sellerId;
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

    const calculatePrice = this.productService.calculatePrice(totalAmount, 42);

    this.cartDetails = {
      cartProduct: items,
      totalItems: items.length,
      totalDiscount: 42,
      totalPrice: calculatePrice.price.toFixed(2),
      discountAmount: calculatePrice.discountedRate.toFixed(2),
      totalPriceBeforeDiscount: totalAmount.toFixed(2),
    };
  }

  calculateTotalPrice() {
    let total = 0;
    if (this.cartDetails.cartProduct) {
      this.cartDetails?.cartProduct.map((item: CartProduct) => {
        item.totalPrice = (item.salePrice! * item.quantity).toFixed(2);
        total += item.salePrice! * item.quantity;
      });

      const calculatePrice = this.productService.calculatePrice(
        total,
        this.cartDetails.totalDiscount
      );
      this.cartDetails.totalPrice = calculatePrice.price.toFixed(2);
      this.cartDetails.totalPriceBeforeDiscount = total.toFixed(2);
      this.cartDetails.discountAmount =
        calculatePrice.discountedRate.toFixed(2);
    }
  }

  checkout() {
    if (this.authService.isLoggedIn) {
      this.orderService.orderCartDetails = this.cartDetails;
      this._router.navigate(['store/checkout']);
    } else {
      this._router.navigate(['/auth/login']);
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
