import { BlockModel } from "../model/block/block-model.js";
import { type DraftModel } from "../model/block/draft.js";
import type { Store } from "../model/store/store.js";
import type { Schema } from "../schema/schema.js";
import { AssetsManager } from "./assets.js";
import type { TransformerMiddleware } from "./middleware.js";
import { Slice } from "./slice.js";
import type { BlobCRUD, BlockSnapshot, DocCRUD, DocSnapshot, SliceSnapshot } from "./type.js";
export type TransformerOptions = {
  schema: Schema;
  blobCRUD: BlobCRUD;
  docCRUD: DocCRUD;
  middlewares?: TransformerMiddleware[];
};
export declare class Transformer {
  private readonly _adapterConfigs;
  private readonly _transformerConfigs;
  private readonly _assetsManager;
  private readonly _schema;
  private readonly _docCRUD;
  private readonly _disposables;
  private readonly _slots;
  blockToSnapshot: (model: DraftModel | BlockModel) => BlockSnapshot | undefined;
  docToSnapshot: (doc: Store) => DocSnapshot | undefined;
  sliceToSnapshot: (slice: Slice) => SliceSnapshot | undefined;
  snapshotToBlock: (
    snapshot: BlockSnapshot,
    doc: Store,
    parent?: string,
    index?: number,
  ) => Promise<BlockModel | undefined>;
  snapshotToDoc: (snapshot: DocSnapshot) => Promise<Store | undefined>;
  snapshotToModelData: (
    snapshot: BlockSnapshot,
  ) => Promise<import("./base.js").SnapshotNode<object> | undefined>;
  snapshotToSlice: (
    snapshot: SliceSnapshot,
    doc: Store,
    parent?: string,
    index?: number,
  ) => Promise<Slice | undefined>;
  walk: (snapshot: DocSnapshot, callback: (block: BlockSnapshot) => void) => void;
  get adapterConfigs(): Map<string, string>;
  get assets(): Map<string, Blob>;
  get assetsManager(): AssetsManager;
  get schema(): Schema;
  get docCRUD(): DocCRUD;
  constructor({ blobCRUD, schema, docCRUD, middlewares }: TransformerOptions);
  private _blockToSnapshot;
  private _convertFlatSnapshots;
  private _convertSnapshotToDraftModel;
  private _exportDocMeta;
  private _flattenSnapshot;
  private _getSchema;
  private _getTransformer;
  private _insertBlockTree;
  private _rebuildBlockTree;
  private _snapshotToBlock;
  private _triggerBeforeImportEvent;
  reset(): void;
  [Symbol.dispose](): void;
}
//# sourceMappingURL=transformer.d.ts.map
