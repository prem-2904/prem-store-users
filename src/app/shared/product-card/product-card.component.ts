import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  effect,
  inject,
  input,
} from '@angular/core';
import { IProducts } from '../../utils/products';
import { Router, RouterLink } from '@angular/router';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ProductsService } from '../../services/products.service';
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, SlickCarouselModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  // @Input({ required: true }) product!: IProducts;
  product = input.required<IProducts>();
  // product!: IProducts;
  @Output() wishlist = new EventEmitter<any>();
  @Output() cart = new EventEmitter<any>();
  slideConfig = { slidesToShow: 5, slidesToScroll: 1 };
  _router = inject(Router);
  isMobile!: boolean;
  productService = inject(ProductsService);

  constructor() {
    effect(() => {
      // this.product = this.productSignal();
      console.log('products', this.product());
    });
  }

  ngOnInit() {
    console.log('products', this.product());
    this.checkIfMobile(); // Check initially
    window.addEventListener('resize', () => {
      console.log('resize triggered!');
      this.checkIfMobile(); // Recheck when window is resized
    });
  }

  redirectToProductDetails(productName: string, productId: string) {
    this._router.navigate(['store/products', productName], {
      queryParams: { pid: productId },
    });
  }

  wishlistAction(
    productId: string,
    listIndex: number,
    listId: string | undefined
  ) {
    this.wishlist.emit({
      productId: productId,
      rowI: listIndex,
      listId: listId,
    });
  }

  cartAction(productId: string, cartIndex: number, cartId: string | undefined) {
    this.cart.emit({ productId: productId, rowI: cartIndex, cartId: cartId });
  }

  checkIfMobile() {
    // Determine if the window width qualifies as a mobile screen
    this.isMobile = window.innerWidth <= 768; // Adjust threshold as needed
    if (this.isMobile) {
      this.slideConfig = { slidesToShow: 1, slidesToScroll: 1 };
    } else {
      this.slideConfig = { slidesToShow: 5, slidesToScroll: 1 };
    }
  }

  ngOnChanges(change: SimpleChanges) {
    console.log('changes detected', change);
  }
}
