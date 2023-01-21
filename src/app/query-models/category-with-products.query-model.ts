import { ProductModel } from './../models/product.model';
export interface CategoryWithProductsQueryModel {
readonly  name: string;
readonly  imageUrl: string;
readonly  products: ProductModel[];
readonly  id: string;
}
