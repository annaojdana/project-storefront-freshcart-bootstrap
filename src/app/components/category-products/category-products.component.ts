import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, of, BehaviorSubject } from 'rxjs';
import {
  shareReplay,
  map,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { FilterOptionsQueryModel } from '../../query-models/filter-options.query-model';
import { RatingStarsQueryModel } from '../../query-models/rating-stars.query-model';
import { CategoryModel } from '../../models/category.model';
import { ProductsWithCategoryNameQueryModel } from '../../query-models/products-with-category-name.query-model';
import { StoreModel } from '../../models/store.model';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';
import { StoresService } from '../../services/stores.service';
import { ProductModel } from '../../models/product.model';

@Component({
  selector: 'app-category-products',
  styleUrls: ['./category-products.component.scss'],
  templateUrl: './category-products.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryProductsComponent {
  readonly filterOptions$: Observable<FilterOptionsQueryModel[]> = of([
    { id: 1, value: 'Featured', order: 'desc' },
    { id: 2, value: 'Price: Low to High', order: 'asc' },
    { id: 3, value: 'Price: High to Low', order: 'desc' },
    { id: 4, value: 'Avg. Rating', order: 'desc' },
  ]);

  readonly starsFilter$: Observable<RatingStarsQueryModel[]> = of([
    {
      stars: [1, 1, 1, 1, 1],
      id: '1',
      value: 5,
    },
    {
      stars: [1, 1, 1, 1, 0],
      id: '2',
      value: 4,
    },
    {
      stars: [1, 1, 1, 0, 0],
      id: '3',
      value: 3,
    },
    {
      stars: [1, 1, 0, 0, 0],
      id: '4',
      value: 2,
    },
  ]);
  readonly form: FormGroup = new FormGroup({
    selectFilter: new FormControl({ id: 1, value: 'Featured', order: 'desc' }),
  });
  readonly filterForm: FormGroup = new FormGroup({
    priceFrom: new FormControl(),
    priceTo: new FormControl(),
    rating: new FormControl(),
    stores: new FormControl(),
  });

  readonly categories$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategory();
  readonly categoryDetails$: Observable<CategoryModel> =
    this._activatedRoute.params.pipe(
      switchMap((data) =>
        this._categoriesService.getOneCategory(data['categoryId'])
      )
    );
  readonly paginationData$: Observable<{
    pageSize: number;
    pageNumber: number;
  }> = this._activatedRoute.queryParams.pipe(
    map((data) => {
      return {
        pageSize: data['pageSize'] === undefined ? 5 : +data['pageSize'],
        pageNumber: data['pageNumber'] === undefined ? 1 : +data['pageNumber'],
      };
    })
  );
  readonly sortedProducts$: Observable<ProductsWithCategoryNameQueryModel[]> =
    combineLatest([
      this._activatedRoute.params,
      this._productsService.getAll(),
      this._categoriesService.getAllCategory(),
      this.form.valueChanges.pipe(
        startWith({ selectFilter: { id: 1, value: 'Featured', order: 'desc' } })
      ),
    ]).pipe(
      map(([params, products, categories, selectFilter]) =>
        this._mapToProductsWithCategoryName(products, categories)
          .filter((p) => p.category.id.includes(params['categoryId']))
          .sort((a, b) => {
            const select = selectFilter['selectFilter'];
            if (select.id === 2) {
              return a.price - b.price;
            }
            if (select.id === 3) {
              return b.price - a.price;
            }
            if (select.id === 4) {
              return b.ratingValue - a.ratingValue;
            }
            return b.featureValue - a.featureValue;
          })
      ),
      tap(console.log)
    );
  readonly stores$: Observable<StoreModel[]> =
    this._storesService.getAllStores();
  private _selectedStoresSubject: BehaviorSubject<Set<string>> =
    new BehaviorSubject<Set<string>>(new Set());
  public selectedStores$: Observable<Set<string>> =
    this._selectedStoresSubject.asObservable();
  readonly filteredProducts$: Observable<ProductsWithCategoryNameQueryModel[]> =
    combineLatest([
      this.sortedProducts$,
      this._selectedStoresSubject,
      this.filterForm.valueChanges.pipe(
        startWith({
          priceFrom: 0,
          priceTo: 2000,
        })
      ),
    ]).pipe(
      map(([products, stores, filterForm]) => {
        console.log(stores);
        return products
          .filter(
            (p) =>
              p.price >= (filterForm.priceFrom ?? 0) &&
              p.price <= (filterForm.priceTo ?? 2000)
          )
          .filter((p) =>
            filterForm.rating
              ? Math.floor(p.ratingValue) === filterForm.rating
              : p
          )
          .filter((p) =>
            stores.size > 0
              ? stores.forEach((s) => (p.storeIds.includes(s) ? p : []))
              : p
          );
      })
    );

  readonly productsList$: Observable<ProductsWithCategoryNameQueryModel[]> =
    combineLatest([this.paginationData$, this.filteredProducts$]).pipe(
      map(([pagination, products]) => {
        return products.slice(
          (pagination.pageNumber - 1) * pagination.pageSize,
          pagination.pageNumber * pagination.pageSize
        );
      }),
      shareReplay(1)
    );

  public pageSizeOptions$: Observable<number[]> = of([5, 10, 15]);
  public pageNumberOptions$: Observable<number[]> = combineLatest([
    this.paginationData$,
    this.filteredProducts$,
  ]).pipe(
    map(([pagination, products]) => {
      const pages: number[] = [1];
      const max = Math.ceil(products.length / pagination.pageSize);
      for (let i = 2; i < max + 1; i++) {
        pages.push(i);
      }
      return pages;
    })
  );

  constructor(
    private _categoriesService: CategoriesService,
    private _activatedRoute: ActivatedRoute,
    private _productsService: ProductsService,
    private _router: Router,
    private _storesService: StoresService
  ) {}

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

  onPageChanged(page: number): void {
    this.paginationData$
      .pipe(
        take(1),
        tap((data) => {
          this._router.navigate([], {
            queryParams: {
              pageNumber: page,
              pageSize: data.pageSize,
            },
          });
        })
      )
      .subscribe();
  }
  onLimitChanged(size: number): void {
    combineLatest([this.paginationData$, this.filteredProducts$])
      .pipe(
        take(1),
        tap(([pagination, products]) =>
          this._router.navigate([], {
            queryParams: {
              pageSize: size,
              pageNumber: Math.min(
                pagination.pageNumber,
                Math.ceil(products.length / size)
              ),
            },
          })
        )
      )
      .subscribe();
  }

  onStoreChanged(store: StoreModel): void {
    this._selectedStoresSubject.value.has(store.id)
      ? this._selectedStoresSubject.value.delete(store.id)
      : this._selectedStoresSubject.value.add(store.id);
  }
}
