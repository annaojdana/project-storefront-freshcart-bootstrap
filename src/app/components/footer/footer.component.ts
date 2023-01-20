import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { StoreModel } from '../../models/store.model';
import { CategoriesService } from '../../services/categories.service';
import { StoresService } from '../../services/stores.service';

@Component({
  selector: 'app-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly categoriesList$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategory();
  readonly storesList$: Observable<StoreModel[]> =
    this._storesService.getAllStores();

  constructor(
    private _categoriesService: CategoriesService,
    private _storesService: StoresService
  ) {}
}
