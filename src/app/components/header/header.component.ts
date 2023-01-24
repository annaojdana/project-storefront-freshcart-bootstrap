import { tap } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { CategoriesService } from '../../services/categories.service';

@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly categoriesList$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategory();
  private _mobileMenuSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public mobileMenu$: Observable<boolean> = this._mobileMenuSubject
    .asObservable()
    .pipe(tap(console.log));

  constructor(private _categoriesService: CategoriesService) {}
  onMobileMenuToggle(): void {
    this._mobileMenuSubject.next(!this._mobileMenuSubject.value);
  }
}
