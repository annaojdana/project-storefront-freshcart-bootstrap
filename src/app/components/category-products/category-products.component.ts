import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, of, BehaviorSubject } from 'rxjs';
import {
  debounceTime,
  map,
  shareReplay,
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
  default = { id: 1, key: 'featureValue', value: 'Featured', order: 'desc' };
  readonly filterOptions$: Observable<FilterOptionsQueryModel[]> = of([
    { id: 2, key: 'price', value: 'Price: Low to High', order: 'asc' },
    { id: 3, key: 'price', value: 'Price: High to Low', order: 'desc' },
    { id: 4, key: 'ratingValue', value: 'Avg. Rating', order: 'desc' },
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
  readonly sortForm: FormGroup = new FormGroup({
    select: new FormControl(this.default),
  });
  readonly priceRatingForm: FormGroup = new FormGroup({
    priceFrom: new FormControl(),
    priceTo: new FormControl(),
    rating: new FormControl(),
  });
  readonly storesForm: FormGroup = new FormGroup({
    stores: new FormGroup({}),
    search: new FormControl(),
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
    }),
    shareReplay(1)
  );
  readonly sortedProducts$: Observable<ProductsWithCategoryNameQueryModel[]> =
    combineLatest([
      this._activatedRoute.params,
      this._productsService.getAll(),
      this._categoriesService.getAllCategory(),
      this.sortForm.valueChanges.pipe(
        startWith({
          select: this.default,
        })
      ),
    ]).pipe(
      map(([params, products, categories, select]) =>
        this._productsService.mapToProductsWithCategoryName(products, categories)
          .filter((p) => p.category.id.includes(params['categoryId']))
          .sort((a, b) => {
            return this.sortProductsConditional(select['select'], a, b);
          })
      ),
      shareReplay(1)
    );

  readonly searchValue$: Observable<string> = this.storesForm.valueChanges.pipe(
    map((form) => form.search),
    debounceTime(1000),
    startWith(''),
    shareReplay(1)
  );

  readonly searchedStores$: Observable<StoreModel[]> = combineLatest([
    this._storesService.getAllStores(),
    this.searchValue$,
  ]).pipe(
    map(([stores, search]) =>
      search
        ? stores.filter((s) =>
            s.name.toLowerCase().includes(search.toLowerCase())
          )
        : stores
    ),
    tap((stores) => {
      this.createFormControlForCheckbox(stores);
    })
  );

  public selectedStores$: Observable<string> = combineLatest([
    this.storesForm.valueChanges.pipe(map((form) => form.stores)),
    this._storesService.getAllStores(),
  ]).pipe(
    map(([controls, stores]) => {
      return stores
        .filter((s) => controls[s.id] === true)
        .map((s) => s.id)
        .sort()
        .join(',');
    })
  );

  readonly filteredProducts$: Observable<ProductsWithCategoryNameQueryModel[]> =
    combineLatest([
      this.sortedProducts$,
      this.selectedStores$,
      this.priceRatingForm.valueChanges.pipe(
        startWith({
          priceFrom: 0,
          priceTo: 2000,
        })
      ),
    ]).pipe(
      map(([products, storesIds, priceForm]) => {
        return products
          .filter(
            (p) =>
              p.price >= (priceForm.priceFrom ?? 0) &&
              p.price <= (priceForm.priceTo ?? 2000)
          )
          .filter((p) =>
            priceForm.rating
              ? Math.floor(p.ratingValue) === priceForm.rating
              : p
          )
          .filter((p) => {
            return storesIds ? p.storeIds.join(',').includes(storesIds) : p;
          });
      })
    );

  readonly productsList$: Observable<ProductsWithCategoryNameQueryModel[]> =
    combineLatest([this.paginationData$, this.filteredProducts$]).pipe(
      map(([pagination, products]) => {
        return products.slice(
          (pagination.pageNumber - 1) * pagination.pageSize,
          pagination.pageNumber * pagination.pageSize
        );
      })
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
  private _filterBtnSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public filterBtn$: Observable<boolean> =
    this._filterBtnSubject.asObservable();
  constructor(
    private _categoriesService: CategoriesService,
    private _activatedRoute: ActivatedRoute,
    private _productsService: ProductsService,
    private _router: Router,
    private _storesService: StoresService
  ) {}

  
  private sortProductsConditional(
    select: FilterOptionsQueryModel,
    productA: ProductsWithCategoryNameQueryModel,
    productB: ProductsWithCategoryNameQueryModel
  ): number {

    if (select.order === 'desc') {
      return (
        +productB[select.key as keyof typeof productB] -
        +productA[select.key as keyof typeof productA]
      );
    }
    if (select.order === 'asc') {
      return (
        +productA[select.key as keyof typeof productA] -
        +productB[select.key as keyof typeof productB]
      );
    }
    return 0;
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
  onFilterToggle(): void {
    this._filterBtnSubject.next(!this._filterBtnSubject.value);
  }
  private createFormControlForCheckbox(stores: StoreModel[]) {
    const targetGroup: FormGroup = this.storesForm.get('stores') as FormGroup;
    stores.forEach((s) => targetGroup.addControl(s.id, new FormControl(false)));
  }
}
