import { BlockModel } from "../model/block/block-model.js";
import { type DraftModel } from "../model/block/draft.js";
import type { Store } from "../model/store/store.js";
type SliceData = {
  content: DraftModel[];
  workspaceId: string;
  pageId: string;
};
export declare class Slice {
  readonly data: SliceData;
  get content(): DraftModel[];
  get docId(): string;
  get workspaceId(): string;
  constructor(data: SliceData);
  static fromModels(doc: Store, models: DraftModel[] | BlockModel[]): Slice;
}
export {};
//# sourceMappingURL=slice.d.ts.map
