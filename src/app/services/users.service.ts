import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
const BASE_URL = environment.API_BASE;
@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private _http: HttpClient) {}

  createAccount(user: any) {
    return this._http.post(`${BASE_URL}/api/users/createAccount`, user);
  }
}
