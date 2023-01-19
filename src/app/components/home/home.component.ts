import { StoreTagsModel } from './../../models/store-tags.model';
import { StoresWithTagsQueryModel } from './../../query-models/stores-with-tags.query-model';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CategoryModel } from '../../models/category.model';
import { StoreModel } from '../../models/store.model';
import { CategoriesService } from '../../services/categories.service';
import { StoresService } from '../../services/stores.service';

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

  constructor(
    private _categoriesService: CategoriesService,
    private _storesService: StoresService
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
      distanceInKms: store.distanceInMeters/1000,
      tags: (store.tagIds ?? []).map((id) => tagMap[id]?.name),
      id: store.id,
    }));
  }
}
