import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StoreModel } from '../models/store.model';
import { StoreTagsModel } from '../models/store-tags.model';

@Injectable({ providedIn: 'root' })
export class StoresService {
  constructor(private _httpClient: HttpClient) {}

  getAllStores(): Observable<StoreModel[]> {
    return this._httpClient.get<StoreModel[]>(
      'https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-stores'
    );
  }

  getAllStoreTags(): Observable<StoreTagsModel[]> {
    return this._httpClient.get<StoreTagsModel[]>(
      'https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-store-tags'
    );
  }
}
