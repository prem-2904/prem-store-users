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

  ngOnDestroy() {
    this.destroyRef$.next(true);
    this.destroyRef$.unsubscribe();
  }
}
