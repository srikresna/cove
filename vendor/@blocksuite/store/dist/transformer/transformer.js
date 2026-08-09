import { DisposableGroup } from '@blocksuite/global/disposable';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { nextTick } from '@blocksuite/global/utils';
import { Subject } from 'rxjs';
import { BlockModel } from '../model/block/block-model.js';
import { toDraftModel } from '../model/block/draft.js';
import { AssetsManager } from './assets.js';
import { BaseBlockTransformer } from './base.js';
import { Slice } from './slice.js';
import { BlockSnapshotSchema, DocSnapshotSchema, SliceSnapshotSchema, } from './type.js';
// The number of blocks to insert in one batch
const BATCH_SIZE = 100;
export class Transformer {
    get adapterConfigs() {
        return this._adapterConfigs;
    }
    get assets() {
        return this._assetsManager.getAssets();
    }
    get assetsManager() {
        return this._assetsManager;
    }
    get schema() {
        return this._schema;
    }
    get docCRUD() {
        return this._docCRUD;
    }
    constructor({ blobCRUD, schema, docCRUD, middlewares = [], }) {
        this._adapterConfigs = new Map();
        this._transformerConfigs = new Map();
        this._disposables = new DisposableGroup();
        this._slots = {
            beforeImport: new Subject(),
            afterImport: new Subject(),
            beforeExport: new Subject(),
            afterExport: new Subject(),
        };
        this.blockToSnapshot = (model) => {
            try {
                const draftModel = model instanceof BlockModel ? toDraftModel(model) : model;
                const snapshot = this._blockToSnapshot(draftModel);
                if (!snapshot) {
                    return;
                }
                BlockSnapshotSchema.parse(snapshot);
                return snapshot;
            }
            catch (error) {
                console.error(`Error when transforming block to snapshot:`);
                console.error(error);
                return;
            }
        };
        this.docToSnapshot = (doc) => {
            try {
                this._slots.beforeExport.next({
                    type: 'page',
                    page: doc,
                });
                const rootModel = doc.root;
                const meta = this._exportDocMeta(doc);
                if (!rootModel) {
                    throw new BlockSuiteError(ErrorCode.TransformerError, 'Root block not found in doc');
                }
                const blocks = this.blockToSnapshot(toDraftModel(rootModel));
                if (!blocks) {
                    return;
                }
                const docSnapshot = {
                    type: 'page',
                    meta,
                    blocks,
                };
                this._slots.afterExport.next({
                    type: 'page',
                    page: doc,
                    snapshot: docSnapshot,
                });
                DocSnapshotSchema.parse(docSnapshot);
                return docSnapshot;
            }
            catch (error) {
                console.error(`Error when transforming doc to snapshot:`);
                console.error(error);
                return;
            }
        };
        this.sliceToSnapshot = (slice) => {
            try {
                this._slots.beforeExport.next({
                    type: 'slice',
                    slice,
                });
                const { content, pageId, workspaceId } = slice.data;
                const contentSnapshot = [];
                for (const block of content) {
                    const blockSnapshot = this.blockToSnapshot(block);
                    if (!blockSnapshot) {
                        return;
                    }
                    contentSnapshot.push(blockSnapshot);
                }
                const snapshot = {
                    type: 'slice',
                    workspaceId,
                    pageId,
                    content: contentSnapshot,
                };
                this._slots.afterExport.next({
                    type: 'slice',
                    slice,
                    snapshot,
                });
                SliceSnapshotSchema.parse(snapshot);
                return snapshot;
            }
            catch (error) {
                console.error(`Error when transforming slice to snapshot:`);
                console.error(error);
                return;
            }
        };
        this.snapshotToBlock = async (snapshot, doc, parent, index) => {
            try {
                BlockSnapshotSchema.parse(snapshot);
                const model = await this._snapshotToBlock(snapshot, doc, parent, index);
                if (!model)
                    return;
                return model;
            }
            catch (error) {
                console.error(`Error when transforming snapshot to block:`);
                console.error(error);
                return;
            }
        };
        this.snapshotToDoc = async (snapshot) => {
            try {
                this._slots.beforeImport.next({
                    type: 'page',
                    snapshot,
                });
                DocSnapshotSchema.parse(snapshot);
                const { meta, blocks } = snapshot;
                const doc = this.docCRUD.create(meta.id);
                doc.load();
                await this.snapshotToBlock(blocks, doc);
                this._slots.afterImport.next({
                    type: 'page',
                    snapshot,
                    page: doc,
                });
                return doc;
            }
            catch (error) {
                console.error(`Error when transforming snapshot to doc:`);
                console.error(error);
                return;
            }
        };
        this.snapshotToModelData = async (snapshot) => {
            try {
                const { children, flavour, props, id } = snapshot;
                const schema = this._getSchema(flavour);
                const snapshotLeaf = {
                    id,
                    flavour,
                    props,
                };
                const transformer = this._getTransformer(schema);
                const modelData = await transformer.fromSnapshot({
                    json: snapshotLeaf,
                    assets: this._assetsManager,
                    children,
                });
                return modelData;
            }
            catch (error) {
                console.error(`Error when transforming snapshot to model data:`);
                console.error(error);
                return;
            }
        };
        this.snapshotToSlice = async (snapshot, doc, parent, index) => {
            try {
                SliceSnapshotSchema.parse(snapshot);
                this._slots.beforeImport.next({
                    type: 'slice',
                    snapshot,
                });
                const { content, workspaceId, pageId } = snapshot;
                // Create a temporary root snapshot to encompass all content blocks
                const tmpRootSnapshot = {
                    id: 'temporary-root',
                    flavour: 'affine:page',
                    props: {},
                    type: 'block',
                    children: content,
                };
                for (const block of content) {
                    this._triggerBeforeImportEvent(block, parent, index);
                }
                const flatSnapshots = [];
                this._flattenSnapshot(tmpRootSnapshot, flatSnapshots, parent, index);
                const blockTree = await this._convertFlatSnapshots(flatSnapshots);
                const first = content[0];
                // check if the slice is already in the doc
                if (first && doc.hasBlock(first.id)) {
                    // if the slice is already in the doc, we need to move the blocks instead of adding them
                    const models = content
                        .map(block => doc.getBlock(block.id)?.model)
                        .filter(Boolean);
                    const parentModel = parent ? doc.getBlock(parent)?.model : undefined;
                    if (!parentModel) {
                        throw new BlockSuiteError(ErrorCode.TransformerError, 'Parent block not found in doc when moving slice');
                    }
                    const targetSibling = index !== undefined ? parentModel.children[index] : null;
                    doc.moveBlocks(models, parentModel, targetSibling);
                }
                else {
                    await this._insertBlockTree(blockTree.children, doc, parent, index);
                }
                const contentBlocks = blockTree.children
                    .map(tree => doc.getModelById(tree.draft.id))
                    .filter((x) => x !== null)
                    .map(model => toDraftModel(model));
                const slice = new Slice({
                    content: contentBlocks,
                    workspaceId,
                    pageId,
                });
                this._slots.afterImport.next({
                    type: 'slice',
                    snapshot,
                    slice,
                });
                return slice;
            }
            catch (error) {
                console.error(`Error when transforming snapshot to slice:`);
                console.error(error);
                return;
            }
        };
        this.walk = (snapshot, callback) => {
            const walk = (block) => {
                try {
                    callback(block);
                }
                catch (error) {
                    console.error(`Error when walking snapshot:`);
                    console.error(error);
                }
                if (block.children) {
                    block.children.forEach(walk);
                }
            };
            walk(snapshot.blocks);
        };
        this._assetsManager = new AssetsManager({ blob: blobCRUD });
        this._schema = schema;
        this._docCRUD = docCRUD;
        middlewares.forEach(middleware => {
            const cleanup = middleware({
                slots: this._slots,
                docCRUD: this._docCRUD,
                assetsManager: this._assetsManager,
                adapterConfigs: this._adapterConfigs,
                transformerConfigs: this._transformerConfigs,
            });
            if (cleanup) {
                this._disposables.add(cleanup);
            }
        });
    }
    _blockToSnapshot(model) {
        this._slots.beforeExport.next({
            type: 'block',
            model,
        });
        const schema = this._getSchema(model.flavour);
        const transformer = this._getTransformer(schema);
        const snapshotLeaf = transformer.toSnapshot({
            model,
            assets: this._assetsManager,
        });
        const children = model.children
            .map(child => {
            return this._blockToSnapshot(child);
        })
            .filter(Boolean);
        const snapshot = {
            type: 'block',
            ...snapshotLeaf,
            children,
        };
        this._slots.afterExport.next({
            type: 'block',
            model,
            snapshot,
        });
        return snapshot;
    }
    async _convertFlatSnapshots(flatSnapshots) {
        // Phase 1: Convert snapshots to draft models in series
        // This is not time-consuming, this is faster than Promise.all
        const draftModels = [];
        for (const flat of flatSnapshots) {
            const draft = await this._convertSnapshotToDraftModel(flat);
            if (draft) {
                draft.id = flat.snapshot.id;
            }
            draftModels.push({
                draft,
                snapshot: flat.snapshot,
                parentId: flat.parentId,
                index: flat.index,
            });
        }
        // Phase 2: Filter out the models that failed to convert
        const validDraftModels = draftModels.filter(item => !!item.draft);
        // Phase 3: Rebuild the block trees
        const blockTree = this._rebuildBlockTree(validDraftModels);
        return blockTree;
    }
    async _convertSnapshotToDraftModel(flat) {
        try {
            const { children, flavour } = flat.snapshot;
            const schema = this._getSchema(flavour);
            const transformer = this._getTransformer(schema);
            const { props } = await transformer.fromSnapshot({
                json: {
                    id: flat.snapshot.id,
                    flavour: flat.snapshot.flavour,
                    props: flat.snapshot.props,
                },
                assets: this._assetsManager,
                children,
            });
            return {
                id: flat.snapshot.id,
                flavour: flat.snapshot.flavour,
                children: [],
                props,
            };
        }
        catch (error) {
            console.error(`Error when transforming snapshot to model data:`);
            console.error(error);
            return;
        }
    }
    _exportDocMeta(doc) {
        const docMeta = doc.meta;
        if (!docMeta) {
            throw new BlockSuiteError(ErrorCode.TransformerError, 'Doc meta not found');
        }
        return {
            id: docMeta.id,
            title: docMeta.title,
            createDate: docMeta.createDate,
            tags: [], // for backward compatibility
        };
    }
    _flattenSnapshot(snapshot, flatSnapshots, parentId, index) {
        flatSnapshots.push({ snapshot, parentId, index });
        if (snapshot.children) {
            snapshot.children.forEach((child, idx) => {
                this._flattenSnapshot(child, flatSnapshots, snapshot.id, idx);
            });
        }
    }
    _getSchema(flavour) {
        const schema = this.schema.flavourSchemaMap.get(flavour);
        if (!schema) {
            throw new BlockSuiteError(ErrorCode.TransformerError, `Flavour schema not found for ${flavour}`);
        }
        return schema;
    }
    _getTransformer(schema) {
        return (schema.transformer?.(this._transformerConfigs) ??
            new BaseBlockTransformer(this._transformerConfigs));
    }
    async _insertBlockTree(nodes, doc, parentId, startIndex, counter = 0) {
        for (let index = 0; index < nodes.length; index++) {
            const node = nodes[index];
            const { draft } = node;
            const { id, flavour, props } = draft;
            const actualIndex = startIndex !== undefined ? startIndex + index : undefined;
            doc.addBlock(flavour, { id, ...props }, parentId, actualIndex);
            const model = doc.getBlock(id)?.model;
            if (!model) {
                throw new BlockSuiteError(ErrorCode.TransformerError, `Block not found by id ${id}`);
            }
            this._slots.afterImport.next({
                type: 'block',
                model,
                snapshot: node.snapshot,
            });
            counter++;
            if (counter % BATCH_SIZE === 0) {
                await nextTick();
            }
            if (node.children.length > 0) {
                counter = await this._insertBlockTree(node.children, doc, id, undefined, counter);
            }
        }
        return counter;
    }
    _rebuildBlockTree(draftModels) {
        const nodeMap = new Map();
        // First pass: create nodes and add them to the map
        draftModels.forEach(({ draft, snapshot }) => {
            nodeMap.set(draft.id, { draft, snapshot, children: [] });
        });
        const root = nodeMap.get(draftModels[0].draft.id);
        // Second pass: build the tree structure
        draftModels.forEach(({ draft, parentId, index }) => {
            const node = nodeMap.get(draft.id);
            if (!node)
                return;
            if (parentId) {
                const parentNode = nodeMap.get(parentId);
                if (parentNode && index !== undefined) {
                    parentNode.children[index] = node;
                }
            }
        });
        if (!root) {
            throw new Error('No root node found in the tree');
        }
        return root;
    }
    async _snapshotToBlock(snapshot, doc, parent, index) {
        this._triggerBeforeImportEvent(snapshot, parent, index);
        const flatSnapshots = [];
        this._flattenSnapshot(snapshot, flatSnapshots, parent, index);
        const blockTree = await this._convertFlatSnapshots(flatSnapshots);
        await this._insertBlockTree([blockTree], doc, parent, index);
        return doc.getBlock(snapshot.id)?.model ?? null;
    }
    _triggerBeforeImportEvent(snapshot, parent, index) {
        const traverseAndTrigger = (node, parent, index) => {
            this._slots.beforeImport.next({
                type: 'block',
                snapshot: node,
                parent: parent,
                index: index,
            });
            if (node.children) {
                node.children.forEach((child, idx) => {
                    traverseAndTrigger(child, node.id, idx);
                });
            }
        };
        traverseAndTrigger(snapshot, parent, index);
    }
    reset() {
        this._assetsManager.cleanup();
    }
    [Symbol.dispose]() {
        this._disposables.dispose();
        this._assetsManager.cleanup();
    }
}
