import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
const API_BASE = environment.API_BASE;
@Injectable({
  providedIn: 'root',
})
export class RatingService {
  constructor(private _http: HttpClient) {}

  addRating(payload: any) {
    return this._http.post(`${API_BASE}/rating/addrating`, payload);
  }

  getRating(orderId: string) {
    return this._http.get(`${API_BASE}/rating/getOrdersRating/${orderId}`);
  }
}
