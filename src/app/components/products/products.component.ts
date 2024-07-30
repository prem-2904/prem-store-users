import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent {
  _router = inject(Router);

  navigateToProduct(productName: string) {
    console.log('navigate-product', productName);
    this._router.navigate(['store/products', productName]);
  }
}
