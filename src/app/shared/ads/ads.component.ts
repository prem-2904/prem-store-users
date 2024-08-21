import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SlickCarouselModule } from 'ngx-slick-carousel';
@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [SlickCarouselModule],
  templateUrl: './ads.component.html',
  styleUrl: './ads.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdsComponent {
  slides = [
    { img: 'assets/banners/b2.jpeg' },
    { img: 'assets/banners/b3.jpg' },
    { img: 'assets/banners/b4.jpg' },
    { img: 'assets/banners/b5.jpg' },
    { img: 'assets/banners/b6.jpg' },
  ];
  slideConfig = { slidesToShow: 1, slidesToScroll: 1 };
}
