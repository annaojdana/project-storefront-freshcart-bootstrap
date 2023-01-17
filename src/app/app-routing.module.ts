import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryProductsComponent } from './components/category-products/category-products.component';
import { StoreProductsComponent } from './components/store-products/store-products.component';
import { HomeComponent } from './components/home/home.component';
import { CategoryProductsComponentModule } from './components/category-products/category-products.component-module';
import { StoreProductsComponentModule } from './components/store-products/store-products.component-module';
import { HomeComponentModule } from './components/home/home.component-module';

const routes: Routes = [{ path: 'categories/:categoryId', component: CategoryProductsComponent }, { path: 'stores/:storeId', component: StoreProductsComponent }, { path: '', component: HomeComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes), CategoryProductsComponentModule, StoreProductsComponentModule, HomeComponentModule],
  exports: [RouterModule],
})
export class AppRoutingModule { }
