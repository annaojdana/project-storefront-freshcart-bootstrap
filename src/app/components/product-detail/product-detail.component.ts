import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ProductModel } from '../../models/product.model';
import { ProductsService } from '../../services/products.service';
import { CategoriesService } from '../../services/categories.service';
import { CategoryModel } from '../../models/category.model';
import { ProductsWithCategoryNameQueryModel } from '../../query-models/products-with-category-name.query-model';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent {
  readonly productDetail$: Observable<ProductsWithCategoryNameQueryModel> =
    combineLatest([
      this._activatedRoute.params.pipe(
        switchMap((data) => this._productsService.getOne(data['productId']))
      ),
      this._categoriesService.getAllCategory(),
    ]).pipe(
      map(([product, categories]) =>
        this._mapToProductsWithCategoryName(product, categories)
      )
    );

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _productsService: ProductsService,
    private _categoriesService: CategoriesService
  ) {}

  private _mapToProductsWithCategoryName(
    product: ProductModel,
    categories: CategoryModel[]
  ): ProductsWithCategoryNameQueryModel {
    const categoryMap = categories.reduce(
      (a, c) => ({ ...a, [c.id]: c }),
      {}
    ) as Record<string, CategoryModel>;
    return {
      ...product,
      category: categoryMap[product.categoryId],
      stars: this.ratingToArray(product.ratingValue),
    };
  }

  private ratingToArray(ratingValue: number): number[] {
    const value: number[] = [];

    for (let i = 1; i <= ratingValue; i++) {
      value.push(1);
    }

    ratingValue % 1 === 0 ? value : value.push(0.5);
    return value;
  }
}
