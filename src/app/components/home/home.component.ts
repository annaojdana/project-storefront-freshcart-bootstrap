import { CategoryWithProductsQueryModel } from './../../query-models/category-with-products.query-model';

import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CategoryModel } from '../../models/category.model';
import { StoresWithTagsQueryModel } from '../../query-models/stores-with-tags.query-model';
import { ProductModel } from '../../models/product.model';
import { CategoriesService } from '../../services/categories.service';
import { StoresService } from '../../services/stores.service';
import { ProductsService } from '../../services/products.service';
import { StoreModel } from '../../models/store.model';
import { StoreTagsModel } from '../../models/store-tags.model';

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  readonly categoriesList$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategory();

  readonly storesListWithTags$: Observable<StoresWithTagsQueryModel[]> =
    combineLatest([
      this._storesService.getAllStores(),
      this._storesService.getAllStoreTags(),
    ]).pipe(
      map(([stores, tags]) => {
        return this._mapToStoresWithTagsQueryModel(stores, tags);
      })
    );
  readonly productsList$: Observable<CategoryWithProductsQueryModel[]> =
    combineLatest([
      this._productsService.getAll(),
      this._categoriesService.getAllCategory(),
    ]).pipe(
      map(([products, categories]) =>
        this._mapToCategoryWithProducts(products, categories)
          .filter((c) => c.id === '5' || c.id === '2')
          .sort((a, b) => +b.id - +a.id)
      ),

      tap(console.log)
    );

  constructor(
    private _categoriesService: CategoriesService,
    private _storesService: StoresService,
    private _productsService: ProductsService
  ) {}

  private _mapToStoresWithTagsQueryModel(
    stores: StoreModel[],
    tags: StoreTagsModel[]
  ): StoresWithTagsQueryModel[] {
    const tagMap = tags.reduce((a, t) => ({ ...a, [t.id]: t }), {}) as Record<
      string,
      StoreTagsModel
    >;
    return stores.map((store) => ({
      name: store.name,
      logoUrl: store.logoUrl,
      distanceInKms: store.distanceInMeters / 1000,
      tags: (store.tagIds ?? []).map((id) => tagMap[id]?.name),
      id: store.id,
    }));
  }
  private _mapToCategoryWithProducts(
    products: ProductModel[],
    categories: CategoryModel[]
  ): CategoryWithProductsQueryModel[] {
    // const productsMap = products.reduce(
    //   (a, p) => ({ ...a, [p.categoryId]: p }),
    //   {}
    // ) as Record<string, ProductModel>;
    // console.log(productsMap);

    return categories.map((category) => ({
      name: category.name,
      imageUrl: category.imageUrl,
      id: category.id,
      products: products
        .filter((p) => p.categoryId.includes(category.id))
        .sort((a, b) => b.featureValue - a.featureValue)
        .slice(0, 5),
    }));
  }
}
