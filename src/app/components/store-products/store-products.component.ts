import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { StoreQueryModel } from '../../query-models/store.query-model';
import { StoresService } from '../../services/stores.service';
import { ProductsService } from '../../services/products.service';
import { ProductModel } from '../../models/product.model';
import { StoreModel } from '../../models/store.model';

@Component({
  selector: 'app-store-products',
  styleUrls: ['./store-products.component.scss'],
  templateUrl: './store-products.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreProductsComponent {
  
  readonly storeWithProducts$: Observable<StoreQueryModel> = combineLatest([
    this._activatedRoute.params.pipe(
      switchMap((data) => this._storesService.getOneStore(data['storeId']))
    ),
    this._productsService.getAll(),
  ]).pipe(
    map(([store, products]) => this._mapToStoreWithProducts(products, store)),
    tap(console.log)
  );

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _storesService: StoresService,
    private _productsService: ProductsService
  ) {}

  private _mapToStoreWithProducts(
    products: ProductModel[],
    store: StoreModel
  ): StoreQueryModel {
    return {
      name: store.name,
      logoUrl: store.logoUrl,
      id: store.id,
      distanceInKm: store.distanceInMeters / 1000,
      products: products.filter((p) => p.storeIds.includes(store.id)),
    };
  }
}
