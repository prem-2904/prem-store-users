import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
const BASE_URL = environment.API_BASE;
@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  constructor(private _http: HttpClient) {}

  getListOfProducts() {
    return this._http.get(`${BASE_URL}/product/userProducts`);
  }

  getProductDetails(pid: string) {
    return this._http.get(`${BASE_URL}/product/getProducts/product/${pid}`);
  }

  calculatePrice(amount: number, discount: number) {
    let discountedRate = (amount / 100) * discount;
    let amountAfterDiscount = amount - discountedRate;
    return { price: amountAfterDiscount, discountedRate: discountedRate };
  }

  searchProducts(searchKey: string) {
    return this._http.get(
      `${BASE_URL}/product/searchproduct?search=${searchKey}`
    );
  }
}
