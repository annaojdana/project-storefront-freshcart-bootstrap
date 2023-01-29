import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, Observable, map } from 'rxjs';
import { ProductModel } from '../models/product.model';
import { CategoryModel } from '../models/category.model';
import { ProductsWithCategoryNameQueryModel } from '../query-models/products-with-category-name.query-model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  constructor(private _httpClient: HttpClient) {}

  getAll(): Observable<ProductModel[]> {
    return this._httpClient.get<ProductModel[]>(
      `https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-products`
    );
  }

  getOne(id: string): Observable<ProductModel> {
    return this._httpClient.get<ProductModel>(
      `https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-products/${id}`
    );
  }

  getProductsAndMap(): Observable<ProductsWithCategoryNameQueryModel[]> {
    return combineLatest([
      this.getAll(),
      this._httpClient.get<CategoryModel[]>(
        'https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-categories'
      ),
    ]).pipe(
      map(([products, categories]) =>
        this.mapToProductsWithCategoryName(products, categories)
      )
    );
  }

  getDiscount(): number {
    const discount = Math.random();
    return discount > 0.75 ? 0 : discount;
  }
  ratingToArray(ratingValue: number): number[] {
    const value: number[] = [];

    for (let i = 1; i <= ratingValue; i++) {
      value.push(1);
    }

    ratingValue % 1 === 0 ? value : value.push(0.5);
    return value;
  }
  mapToProductsWithCategoryName(
    products: ProductModel[],
    categories: CategoryModel[]
  ): ProductsWithCategoryNameQueryModel[] {
    const categoryMap = categories.reduce(
      (a, c) => ({ ...a, [c.id]: c }),
      {}
    ) as Record<string, CategoryModel>;

    return products.map((product) => {
      const discount = this.getDiscount();
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        discount: Math.round(discount*100),
        discountPrice:
          discount > 0
            ? (product.price * (1 - discount))
            : product.price,
        category: categoryMap[product.categoryId],
        ratingValue: product.ratingValue,
        stars: this.ratingToArray(product.ratingValue),
        ratingCount: product.ratingCount,
        imageUrl: product.imageUrl,
        featureValue: product.featureValue,
        storeIds: product.storeIds,
      };
    });
  }
}
