import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

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
  _router = inject(Router);
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
            this.authService.saveSession(
              'user-session',
              JSON.stringify(user['data'])
            );
            this.authService.saveSession(
              'user-id',
              JSON.stringify(user['data']?._id)
            );
            this.authService.setLoggedUserId();
            this._router.navigate(['/store']);
          },
          error: (err) => {},
        });
    } else {
      alert('Please enter required fields!');
    }
  }

  ngOnDestroy() {
    this.destory$.next(true);
    this.destory$.unsubscribe();
  }
}
