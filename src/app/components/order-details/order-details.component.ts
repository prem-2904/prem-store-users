import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
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
import { RatingModule } from 'primeng/rating';
import { BreadcrumbsComponent } from '../../shared/breadcrumbs/breadcrumbs.component';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RatingService } from '../../services/rating.service';

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
    RatingModule,
    FormsModule,
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
  authService = inject(AuthService);
  ratingService = inject(RatingService);
  breadcrumbsData!: MenuItem[];
  historyEvents: any = [];
  rateProduct: number = 0;
  reviewProduct!: string;
  isAlreadyRated: boolean = false;
  rateDetails!: any;
  ngOnInit() {
    this.loadOrderDetails();
    this.loadRatingDetails();
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

  loadRatingDetails() {
    this.ratingService
      .getRating(this.orderId)
      .pipe(takeUntil(this.destroyRef$))
      .subscribe({
        next: (rating: any) => {
          this.isAlreadyRated = false;
          if (rating['data'] && rating['data'].length > 0) {
            this.rateDetails = rating['data'][0];
            this.isAlreadyRated = true;
          }
        },
        error: (err) => {
          this.toastService.showError(err.message);
        },
      });
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

  addRating() {
    if (this.rateProduct > 0) {
      const payload = {
        productId: this.orderDetails.orderedItem.orderItem._id,
        rating: this.rateProduct,
        comments: !this.reviewProduct ? '' : this.reviewProduct,
        orderId: this.orderDetails.orderData._id,
        isDeleted: false,
        userId: this.authService.loggedUserId,
      };
      this.ratingService
        .addRating(payload)
        .pipe(takeUntil(this.destroyRef$))
        .subscribe({
          next: (rating) => {
            this.toastService.showSuccess('Your rating added!');
          },
          error: (err) => {
            this.toastService.showError(err.message);
          },
        });
      this.toastService.showSuccess('Rating added!' + this.rateProduct);
    } else {
      this.toastService.showError('Please provide some rating!');
    }
  }

  ngOnDestroy() {
    this.destroyRef$.next(true);
    this.destroyRef$.unsubscribe();
  }
}
