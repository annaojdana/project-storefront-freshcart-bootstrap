import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { CategoryModel } from '../../models/category.model';
import { ProductsWithCategoryNameQueryModel } from '../../query-models/products-with-category-name.query-model';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';
import { ProductModel } from '../../models/product.model';

@Component({
  selector: 'app-category-products',
  styleUrls: ['./category-products.component.scss'],
  templateUrl: './category-products.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryProductsComponent {
  readonly filterOptions$: Observable<string[]> = of([
    'Featured',
    'Price Low to high',
    'Price High to Low',
    'Avg. Rating',
  ]);

  readonly categories$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategory();
  readonly categoryDetails$: Observable<CategoryModel> =
    this._activatedRoute.params.pipe(
      switchMap((data) =>
        this._categoriesService.getOneCategory(data['categoryId'])
      )
    );
  readonly products$: Observable<ProductsWithCategoryNameQueryModel[]> =
    combineLatest([
      this._activatedRoute.params,
      this._productsService.getAll(),
      this._categoriesService.getAllCategory(),
    ]).pipe(
      map(([params, products, categories]) =>
        this._mapToProductsWithCategoryName(products, categories).filter((p) =>
          p.category.id.includes(params['categoryId'])
        )
      ),
      tap(console.log)
    );
  readonly filter: FormGroup = new FormGroup({ select: new FormControl() });

  constructor(
    private _categoriesService: CategoriesService,
    private _activatedRoute: ActivatedRoute,
    private _productsService: ProductsService
  ) { }

  private _mapToProductsWithCategoryName(
    products: ProductModel[],
    categories: CategoryModel[]
  ): ProductsWithCategoryNameQueryModel[] {
    const categoryMap = categories.reduce(
      (a, c) => ({ ...a, [c.id]: c }),
      {}
    ) as Record<string, CategoryModel>;
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: categoryMap[product.categoryId],
      ratingValue: product.ratingValue,
      stars: this.ratingToArray(product.ratingValue),
      ratingCount: product.ratingCount,
      imageUrl: product.imageUrl,
      featureValue: product.featureValue,
      storeIds: product.storeIds,
    }));
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
