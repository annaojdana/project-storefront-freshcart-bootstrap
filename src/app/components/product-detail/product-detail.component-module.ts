import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProductDetailComponent } from './product-detail.component';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [ProductDetailComponent],
  providers: [],
  exports: [ProductDetailComponent],
})
export class ProductDetailComponentModule {}
