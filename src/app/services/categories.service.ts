import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryModel } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private _httpClient: HttpClient) {
  }

  getAllCategory(): Observable<CategoryModel[]> {
    return this._httpClient.get<CategoryModel[]>(
      'https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-categories'
    );
  }

  getOneCategory(categoryId:string): Observable<CategoryModel> {
    return this._httpClient.get<CategoryModel>(
      `https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-categories/${categoryId}`
    );
  }
}
