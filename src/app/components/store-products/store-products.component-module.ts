import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreProductsComponent } from './store-products.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  declarations: [StoreProductsComponent],
  providers: [],
  exports: [StoreProductsComponent]
})
export class StoreProductsComponentModule {
}
