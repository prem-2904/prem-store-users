import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { IOrder, ITransactionOrder, OrderItem } from '../utils/orders';
import { CartDetails } from '../utils/products';
const BASE_URL = environment.API_BASE;

function _window(): any {
  return window;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly _http = inject(HttpClient);
  constructor(@Inject(PLATFORM_ID) private platformId: any) {}
  orderData!: IOrder;
  orderItems: OrderItem[] = [];
  orderCartDetails!: CartDetails;

  get nativeWindow(): any {
    if (isPlatformBrowser(this.platformId)) {
      return _window();
    }
  }

  createOrder(payload: any) {
    return this._http.post(`${BASE_URL}/order/createPaymentOrder`, payload);
  }

  createOrderAndTransactions(payload: any) {
    return this._http.post(
      `${BASE_URL}/order/createOrderAndTransaction`,
      payload
    );
  }

  getMyOrders(user: string) {
    return this._http.get(`${BASE_URL}/order/getUsersOrder/${user}`);
  }

  getOrderWithUnit(filters: string) {
    return this._http.get(`${BASE_URL}/order/getOrderIdWithUnit?${filters}`);
  }

  getOrderWithUnitv2(filters: string) {
    return this._http.get(`${BASE_URL}/order/v2/getOrderIdWithUnit?${filters}`);
  }

  cancelOrder(orderId: string) {
    const payload = {
      orderId: orderId,
    };
    return this._http.put(`${BASE_URL}/order/cancelOrder`, payload);
  }

  returnOrder(orderId: string) {
    const payload = {
      orderId: orderId,
    };
    return this._http.put(`${BASE_URL}/order/updateOrder`, payload);
  }
}
