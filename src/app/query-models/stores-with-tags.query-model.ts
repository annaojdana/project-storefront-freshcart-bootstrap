import { StoreTagsModel } from "../models/store-tags.model";

export interface StoresWithTagsQueryModel {
  readonly name: string;
  readonly logoUrl: string;
  readonly distanceInKms: number;
  readonly tags: string[];
  readonly id: string;
}
