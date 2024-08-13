import { Component, inject } from '@angular/core';
import { ActionsService } from '../../services/actions.service';
import { Observable, Subject, switchMap, takeUntil } from 'rxjs';
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
import { ICartDetails, OrderItem } from '../../utils/orders';
import { toSignal } from '@angular/core/rxjs-interop';

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
  isGoodToCheckout$ = new Subject<void>();
  checkoutValidation = toSignal(
    this.isGoodToCheckout$.asObservable().pipe(
      switchMap(() => {
        return this.actionService.validateCheckout(this.loggedUserId);
      })
    )
  );
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
          this.isGoodToCheckout$.next();
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

    const calculatePrice = this.productService.calculatePrice(totalAmount, 0);

    this.cartDetails = {
      cartProduct: items,
      totalItems: items.length,
      totalDiscount: 0,
      totalPrice: calculatePrice.price.toFixed(2),
      discountAmount: calculatePrice.discountedRate.toFixed(2),
      totalPriceBeforeDiscount: totalAmount.toFixed(2),
    };
  }

  calculateTotalPrice(evt: any, cartId: string) {
    let total = 0;
    this.updateCartQuantity(evt, cartId);
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

  updateCartQuantity(evt: any, cartId: string) {
    let quantity = evt.target.value;
    this.actionService
      .updateCartQuantity(cartId, quantity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isGoodToCheckout$.next();
        },
        error: (err) => {},
      });
  }

  checkout() {
    const checkoutValidationData = this.checkoutValidation()?.data;
    if (
      this.authService.isLoggedIn &&
      checkoutValidationData.isGoodToCheckout
    ) {
      this.orderService.orderCartDetails = this.cartDetails;
      this._router.navigate(['store/checkout']);
    } else if (!checkoutValidationData.isGoodToCheckout) {
      this.showErrors();
    } else {
      this._router.navigate(['/auth/login']);
    }
  }

  showErrors() {
    const actualData = this.checkoutValidation()?.data.availableStocks;
    const loopData = Object.keys(actualData);
    loopData.forEach((element: any) => {
      const idx = this.cartDetails.cartProduct.findIndex(
        (data: CartProduct) => data._id === element
      );
      if (idx >= 0) {
        this.cartDetails.cartProduct[idx]['noAvailableQty'] =
          actualData[element]?.isGood;
        this.cartDetails.cartProduct[idx].availableQty =
          actualData[element]?.availableQuan;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
