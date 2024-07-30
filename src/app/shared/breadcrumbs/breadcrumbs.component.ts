import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [BreadcrumbModule, RouterModule, CommonModule],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss',
})
export class BreadcrumbsComponent {
  // items: MenuItem[] | undefined;

  home: MenuItem | undefined = [{ icon: 'pi pi-home', route: '/installation' }];

  @Input({ required: true }) items!: MenuItem[] | undefined;

  ngOnInit() {}
}
