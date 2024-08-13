import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
const API_URL = environment.API_BASE;
@Injectable({
  providedIn: 'root',
})
export class ActionsService {
  addedToCart = signal(0);
  wishlisted = signal(0);
  _http = inject(HttpClient);
  constructor() {}

  increaseAddToCart() {
    this.addedToCart.update((val) => val + 1);
  }

  decreaseAddToCart() {
    this.addedToCart.update((val) => val - 1);
  }

  increaseWishlist() {
    this.wishlisted.update((val) => val + 1);
  }

  decreaseWishlist() {
    this.wishlisted.update((val) => val - 1);
  }

  setAddToCart(cart: number) {
    this.addedToCart.set(cart);
  }

  setWishlist(wishlist: number) {
    this.wishlisted.set(wishlist);
  }

  addToCart(payload: any): Observable<any> {
    return this._http.post(`${API_URL}/wishlist/addtocart`, payload);
  }

  removeFromCart(payload: any): Observable<any> {
    return this._http.post(`${API_URL}/wishlist/removecartitem`, payload);
  }

  updateCartQuantity(id: string, quantity: number): Observable<any> {
    const payload = {
      id: id,
      quantity: quantity,
    };
    return this._http.put(`${API_URL}/wishlist/updateQuantity`, payload);
  }

  getCartItems(id: any): Observable<any> {
    return this._http.get(`${API_URL}/wishlist/getusercart?id=${id}`);
  }

  isItemWishlistCart(itemId: string, productId: string): Observable<any> {
    return this._http.get(
      `${API_URL}/wishlist/isItemWishlistCart?userId=${itemId}&productId=${productId}`
    );
  }

  markWishlist(payload: any): Observable<any> {
    return this._http.post(`${API_URL}/wishlist/markforwishlist`, payload);
  }

  removemarkWishlist(payload: any): Observable<any> {
    return this._http.post(`${API_URL}/wishlist/removewishlist`, payload);
  }

  getWishlistItems(id: any): Observable<any> {
    return this._http.get(`${API_URL}/wishlist/getwishlist?id=${id}`);
  }

  getUserCounts(id: string): Observable<any> {
    return this._http.get(`${API_URL}/wishlist/getcounts?id=${id}`);
  }

  getNotifications(userId: string): Observable<any> {
    return this._http.get(`${API_URL}/notifications/notifications/${userId}`);
  }

  validateCheckout(userId: string): Observable<any> {
    return this._http.get(`${API_URL}/wishlist/validateCheckout/${userId}`);
  }
}
