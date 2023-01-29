import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable} from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ProductsService } from '../../services/products.service';

import { ProductsWithCategoryNameQueryModel } from '../../query-models/products-with-category-name.query-model';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent {
  readonly productDetail$: Observable<ProductsWithCategoryNameQueryModel> =
    this._activatedRoute.params.pipe(
      switchMap((data) =>
        this._productsService
          .getProductsAndMap()
          .pipe(map((products) => products.filter((p) => p.id === data['productId'])[0]))
      )
    );

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _productsService: ProductsService,
  ) {}
}
