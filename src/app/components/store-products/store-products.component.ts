import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import {
  debounceTime,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { StoreQueryModel } from '../../query-models/store.query-model';
import { StoresService } from '../../services/stores.service';
import { ProductsService } from '../../services/products.service';
import { ProductModel } from '../../models/product.model';
import { StoreModel } from '../../models/store.model';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-store-products',
  styleUrls: ['./store-products.component.scss'],
  templateUrl: './store-products.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreProductsComponent {
  readonly searchForm: FormGroup = new FormGroup({
    search: new FormControl(),
  });
  private readonly _searchValue$: Observable<string> =
    this.searchForm.valueChanges.pipe(
      map((form) => form.search),
      debounceTime(1000),
      startWith(''),
      shareReplay(1)
    );

  readonly storeWithProducts$: Observable<StoreQueryModel> = combineLatest([
    this._activatedRoute.params.pipe(
      switchMap((data) => this._storesService.getOneStore(data['storeId']))
    ),
    this._productsService.getAll(),
    this._searchValue$,
  ]).pipe(
    map(([store, products, search]) =>
      this._mapToSearchProducts(products, store, search)
    ),
    tap(console.log),
    shareReplay(1)
  );

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _storesService: StoresService,
    private _productsService: ProductsService
  ) {}

  private _mapToSearchProducts(
    products: ProductModel[],
    store: StoreModel,
    search: string
  ): StoreQueryModel {
    return {
      name: store.name,
      logoUrl: store.logoUrl,
      id: store.id,
      distanceInKm: store.distanceInMeters / 1000,
      products: products
        .filter((p) => p.storeIds.includes(store.id))
        .filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    };
  }
}
