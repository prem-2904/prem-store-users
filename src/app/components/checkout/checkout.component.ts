import { Component, inject } from '@angular/core';
import { OrdersService } from '../../services/orders.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IOrder,
  IPaymentOrder,
  ITransactionOrder,
  OrderItem,
} from '../../utils/orders';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ActionsService } from '../../services/actions.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  orderService = inject(OrdersService);
  authService = inject(AuthService);
  actionService = inject(ActionsService);
  _fb = inject(FormBuilder);
  router = inject(Router);
  destroyRef$ = new Subject<boolean>();
  checkoutForm!: FormGroup;
  cartDetails = this.orderService.orderCartDetails;
  paymentType!: string;
  orderPayload!: IOrder;
  loggedUserId = this.authService.loggedUserId;
  isStartedProcess: boolean = false;
  ngOnInit() {
    console.log(this.orderService.orderCartDetails, 'Order-Data');
    if (!this.orderService?.orderCartDetails) {
      this.router.navigate(['store/cart']);
    }
    this.initCheckoutForm();
  }

  initCheckoutForm() {
    this.checkoutForm = this._fb.group({
      fullName: new FormControl('', [Validators.required]),
      addressLine1: new FormControl('', [Validators.required]),
      addressLine2: new FormControl('', [Validators.required]),
      pincode: new FormControl('', [
        Validators.required,
        Validators.maxLength(6),
        Validators.minLength(6),
      ]),
      mobile: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  checkout() {
    if (this.checkoutForm.valid) {
      this.isStartedProcess = true;
      const orderItems = this.orderItemsPayload();
      const orderDetails = this.checkoutForm.value;
      if (this.paymentType) {
        if (this.paymentType === 'online') {
          this.createPaymentOrder(this.cartDetails.totalPrice);
        } else {
          this.updateTransactionDetails();
        }
      } else {
        alert('Select Payment Type');
        this.isStartedProcess = false;
      }
    } else {
      alert('Fill required fields!');
    }
  }

  createPaymentOrder(totalAmount: string) {
    const paymentPayload: IPaymentOrder = {
      amount: Number(totalAmount),
      currency: 'INR',
      notes: {
        notes_key_1: 'Test Item 1',
        notes_key_2: 'Test Item 2',
      },
      receipt: 'Testing Receipt',
    };

    this.orderService
      .createOrder(paymentPayload)
      .pipe(takeUntil(this.destroyRef$))
      .subscribe({
        next: (order: any) => {
          this.checkoutPage(order['data']);
        },
        error: (err) => {
          this.isStartedProcess = false;
          alert(err);
        },
      });
  }

  checkoutPage(order: ITransactionOrder) {
    const userDetails = this.checkoutForm.value;
    console.log('Checkout-page', order);
    var options = {
      order_id: order.id,
      key: 'rzp_test_GSoY8gussVwa2I',
      amount: order.amount,
      currency: 'INR',
      name: 'Prem Store',
      description: 'Online E-Commerce platform',
      image:
        'https://cdn.pixabay.com/photo/2023/01/22/13/46/swans-7736415_640.jpg',
      handler: (response: any) => {
        if (response != null && response.razorpay_payment_id != null) {
          this.updateTransactionDetails(response);
          console.log(response, 'Payment completed!');
        } else {
          console.log('payment-failed', response);
          this.isStartedProcess = false;
          // this.notifyService.error('User payment failed!', 'Payment Failed');
        }
      },
      prefill: {
        email: userDetails.email,
        contact: userDetails.mobile,
      },
      notes: {
        address: 'Online Prem Store',
      },
      theme: {
        color: '#F37254',
      },
      modal: {
        ondismiss: function () {
          console.log('modal popup closed');
        },
        confirm_close: true,
      },
    };
    var razorPayObject = new this.orderService.nativeWindow.Razorpay(options);
    razorPayObject.on('payment.failed', function (response: any) {
      console.log('Payment Failed', response);
    });
    razorPayObject.open();
  }

  orderItemsPayload() {
    return this.cartDetails.cartProduct?.map((element: any) => {
      let stocks = element?.itemId.availabilityStocks[0];
      let payload: OrderItem = {
        cartId: element?._id,
        itemStockId: stocks._id,
        orderedQuantity: element.quantity,
        orderItem: element?.itemId?._id,
        orderItemPrice: element.salePrice,
        orderStatus: 'ordered',
        orderTotal: element.salePrice * element.quantity,
      };

      return payload;
    });
  }

  updateTransactionDetails(paymentDetails: any = null) {
    // const { orderItems, orderDelivery, payments };
    const orderItems = this.cartDetails.cartProduct;
    const orderDetais = this.checkoutForm.value;
    const orderPayments = this.cartDetails;
    // console.log(orderItems, orderDelivery, payments);
    console.log('update-order-items', orderItems);
    const orderItemsPayload = orderItems.map((item: any) => {
      let stocks = item?.itemId.availabilityStocks[0];
      const orderedItems = {
        orderItem: item.itemId._id,
        orderedQuantity: item.quantity,
        orderItemPrice: item.salePrice,
        orderTotal: item.totalPrice,
        orderStatus: 'ordered',
        cartId: item._id,
        itemStockId: stocks._id,
        sellerId: item.sellerId,
      };

      return orderedItems;
    });
    const payload = {
      totalAmount: orderPayments.totalPrice,
      typeOfPayment: this.paymentType,
      paymentOrderId: paymentDetails?.razorpay_order_id
        ? paymentDetails?.razorpay_order_id
        : 'NA',
      paymentTransactionId: paymentDetails?.razorpay_payment_id
        ? paymentDetails?.razorpay_payment_id
        : 'NA',
      orderFullName: orderDetais.fullName,
      orderAddressLine1: orderDetais.addressLine1,
      orderAddressLine2: orderDetais.addressLine1,
      orderAddressPincode: orderDetais.pincode,
      orderEmail: orderDetais.email,
      orderPhone: orderDetais.mobile,
      orderStatus: this.paymentType == 'inperson' ? 'delivered' : 'ordered',
      orderItems: orderItemsPayload,
      orderedBy: this.loggedUserId,
      updatedBy: this.loggedUserId,
      orderAmountPaid:
        this.paymentType == 'inperson'
          ? 'RECEIVED'
          : paymentDetails?.razorpay_payment_id
          ? 'PAID'
          : 'NOT PAID',
    };

    this.orderService
      .createOrderAndTransactions(payload)
      .pipe(takeUntil(this.destroyRef$))
      .subscribe({
        next: (data: any) => {
          console.log('data-payment', data);
          // this.notifyService.success('Order placed!', 'Order Success');
          this.actionService.setAddToCart(0);
          this.router.navigate(['store/order-summary'], {
            queryParams: { orderId: data['data']._id },
          });
        },
        error: (err) => {
          this.isStartedProcess = false;
          // this.notifyService.error(
          //   'Order failed, Please wait for sometime',
          //   'Order Failed'
          // );
        },
      });
  }

  ngOnDestroy() {
    this.destroyRef$.next(true);
    this.destroyRef$.unsubscribe();
  }
}
