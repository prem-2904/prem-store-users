import { Component, Input, inject } from '@angular/core';
import { OrdersService } from '../../services/orders.service';
import { Subject, takeUntil } from 'rxjs';
import {
  IOrderDetails,
  IOrderHistory,
  IOrderedDetail,
  convertOrderHistory,
  convertOrderItemsDetails,
} from '../../utils/order-details';
import { CommonModule, DatePipe, UpperCasePipe } from '@angular/common';
import { TimelineModule } from 'primeng/timeline';
import { ButtonModule } from 'primeng/button';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { BreadcrumbsComponent } from '../../shared/breadcrumbs/breadcrumbs.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    UpperCasePipe,
    TimelineModule,
    CommonModule,
    ButtonModule,
    DatePipe,
    BreadcrumbsComponent,
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
})
export class OrderDetailsComponent {
  @Input() orderId!: string;
  destroyRef$ = new Subject<boolean>();
  orderDetails!: IOrderedDetail;
  orderService = inject(OrdersService);
  toastService = inject(ToastService);
  breadcrumbsData!: MenuItem[];
  historyEvents: any = [];
  ngOnInit() {
    this.loadOrderDetails();

    this.breadcrumbsData = [
      { icon: 'pi pi-home', route: '/installation' },
      { label: 'Orders', route: '/store/orders' },
      {
        label: this.orderId,
        route: '/store/order-details?orderId=OD00000003',
        queryParams: { orderId: this.orderId },
      },
    ];
  }

  loadOrderDetails() {
    const filterDetails = `orderId=${this.orderId}`;

    this.orderService
      .getOrderWithUnitv2(filterDetails)
      .pipe(takeUntil(this.destroyRef$))
      .subscribe({
        next: (details: any) => {
          this.orderDetails = details['data'];
          this.convertDetails(this.orderDetails);
        },
        error: (err: any) => {
          console.log('error-occured', err);
        },
      });
  }

  convertDetails(orderDetails: IOrderedDetail) {
    const updatedItems = convertOrderItemsDetails(orderDetails.orderedItem);
    const updatedOrderHistory = convertOrderHistory(
      orderDetails.updatedOrderStatus
    );
    this.historyEvents = updatedOrderHistory;
    orderDetails.orderedItem = updatedItems;
  }

  cancelOrder(orderId: string) {
    this.orderService
      .cancelOrder(orderId)
      .pipe(takeUntil(this.destroyRef$))
      .subscribe({
        next: (order: any) => {
          this.toastService.showSuccess(order.message);
          this.loadOrderDetails();
        },
        error: (err) => {
          this.toastService.showError(err.message);
        },
      });
  }

  returnOrder(orderId: string) {
    this.orderService
      .returnOrder(orderId)
      .pipe(takeUntil(this.destroyRef$))
      .subscribe({
        next: (status: any) => {
          this.toastService.showSuccess('Return order initiated!');
          this.loadOrderDetails();
        },
        error: (error) => {
          this.toastService.showError(error.message);
        },
      });
  }

  ngOnDestroy() {
    this.destroyRef$.next(true);
    this.destroyRef$.unsubscribe();
  }
}
