import { Component, inject, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  userEmail!: string;
  password!: string;
  destory$ = new Subject<boolean>();
  authService = inject(AuthService);
  toastService = inject(ToastService);
  _router = inject(Router);
  ngZone = inject(NgZone);

  ngOnInit() {
    google.accounts.id.initialize({
      client_id:
        '897374574290-pij8m9n6ad4hal3u7lleigumdp4knlsr.apps.googleusercontent.com',
      callback: (resp: any) => {
        this.ngZone.run(() => this.handleCredentialResponse(resp));
      },
    });

    google.accounts.id.renderButton(document.getElementById('google-btn'), {
      theme: 'filled_blue',
      size: 'large',
      shape: 'rectangle',
      width: 350,
    });
  }

  handleCredentialResponse(resp: any) {
    console.log('user-login', resp);
    this.authService
      .createUserAccountWithGoogle(resp?.credential)
      .pipe(takeUntil(this.destory$))
      .subscribe({
        next: (res: any) => {
          console.log('google-auth-res', res);
          this.toastService.showSuccess('Your account created Successfully!');
          this.saveUserSession(res['data']);
        },
        error: (err) => {
          this.toastService.showError(err.message);
        },
      });
  }
  validateUser() {
    if (this.userEmail && this.password) {
      const payload = {
        email: this.userEmail,
        password: this.password,
      };

      this.authService
        .validateUser(payload)
        .pipe(takeUntil(this.destory$))
        .subscribe({
          next: (user: any) => {
            this.saveUserSession(user['data']);
          },
          error: (err) => {
            console.log(err);
            this.toastService.showError(err.message);
          },
        });
    } else {
      alert('Please enter required fields!');
    }
  }

  saveUserSession(data: any) {
    this.authService.saveSession('user-session', JSON.stringify(data));
    this.authService.saveSession('user-id', JSON.stringify(data?._id));
    this.authService.setLoggedUserId();
    this._router.navigate(['/store']);
  }

  ngOnDestroy() {
    this.destory$.next(true);
    this.destory$.unsubscribe();
  }
}
