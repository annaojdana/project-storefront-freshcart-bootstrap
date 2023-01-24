import { ProductModel } from './../models/product.model';
export interface StoreQueryModel {
  readonly name: string;
  readonly logoUrl: string;
  readonly distanceInKm: number;
  readonly products: ProductModel[];
  readonly id: string;
}
