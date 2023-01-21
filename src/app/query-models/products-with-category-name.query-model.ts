import { CategoryModel } from './../models/category.model';
export interface ProductsWithCategoryNameQueryModel {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly category: CategoryModel;
  readonly ratingValue: number;
  readonly stars:number[],
  readonly ratingCount: number;
  readonly imageUrl: string;
  readonly featureValue: number;
  readonly storeIds: string[];
}
