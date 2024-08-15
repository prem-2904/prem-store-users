import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { AuthService } from './services/auth.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'prem-store';
  authService = inject(AuthService);
  _router = inject(Router);
  ngOnInit() {
    if (!this.authService.isLoggedInUser()) {
      this._router.navigate(['auth/login']);
    } else {
      this.authService.setLoggedUserId();
    }
  }
}
