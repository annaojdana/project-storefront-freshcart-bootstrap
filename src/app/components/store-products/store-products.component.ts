import { StoreQueryModel } from './../../query-models/store.query-model';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { StoreModel } from '../../models/store.model';
import { StoresService } from '../../services/stores.service';

@Component({
  selector: 'app-store-products',
  styleUrls: ['./store-products.component.scss'],
  templateUrl: './store-products.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreProductsComponent {
  readonly store$: Observable<StoreQueryModel> =
    this._activatedRoute.params.pipe(
      switchMap((data) =>
        this._storesService.getOneStore(data['storeId']).pipe(
          map((s) => ({
            name: s.name,
            logoUrl: s.logoUrl,
            distanceInKm: s.distanceInMeters / 1000,
            tagIds: s.tagIds,
            id: s.id,
          })),
          tap(console.log)
        )
      )
    );

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _storesService: StoresService
  ) {}
}
