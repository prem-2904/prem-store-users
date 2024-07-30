import { Component, inject } from '@angular/core';
// import { CardModule } from 'primeng/card';
import { OrdersService } from '../../services/orders.service';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UpperCasePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [UpperCasePipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent {
  orderService = inject(OrdersService);
  authService = inject(AuthService);
  _router = inject(Router);
  destroyRef$ = new Subject<boolean>();
  ordersList: any;

  ngOnInit() {
    this.loadUserOrders();
  }

  loadUserOrders() {
    this.orderService
      .getMyOrders(this.authService.loggedUserId)
      .pipe(takeUntil(this.destroyRef$))
      .subscribe({
        next: (order: any) => {
          console.log('Order', order);
          this.ordersList = order['data'];
        },
        error: (err) => {
          console.log('order-list-err', err);
        },
      });
  }

  orderDetails(orderId: string) {
    console.log('order-details', orderId);
    this._router.navigate(
      [
        'store/order-details',
        // { orderId: orderId, unitOrderId: itemOrderId },
      ],
      { queryParams: { orderId: orderId } }
    );
  }

  ngOnDestroy() {
    this.destroyRef$.next(true);
    this.destroyRef$.unsubscribe();
  }
}
