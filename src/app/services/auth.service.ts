import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
const BASE_URL = environment.API_BASE;
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loggedUserId!: string;
  isLoggedIn: boolean = false;
  constructor(private _http: HttpClient) {}

  validateUser(payload: any) {
    return this._http.post(`${BASE_URL}/users/validateUser`, payload, {
      withCredentials: true,
    });
  }

  createUserAccountWithGoogle(resp: any) {
    return this._http.post(
      `${BASE_URL}/users/createGoogleUserAccount`,
      { creds: resp },
      {
        withCredentials: true,
      }
    );
  }

  saveSession(key: string, value: string) {
    sessionStorage.setItem(key, value);
  }

  getSessionValue(key: string) {
    if (!sessionStorage.getItem(key)) return null;
    return sessionStorage.getItem(key);
  }

  isLoggedInUser() {
    if (!sessionStorage.getItem('user-session')) return false;
    return true;
  }

  loggedUserDetails() {
    if (!this.isLoggedInUser()) return [];
    const userData = JSON.parse(sessionStorage.getItem('user-session')!);
    return userData;
  }

  setLoggedUserId() {
    if (this.isLoggedInUser()) {
      this.isLoggedIn = true;
      this.loggedUserId = this.loggedUserDetails()?._id;
      return true;
    }
    return false;
  }

  clearUserSession() {
    sessionStorage.clear();
  }

  logoutUser() {
    return this._http.get(`${BASE_URL}/users/logout`, {
      withCredentials: true,
    });
  }
}
