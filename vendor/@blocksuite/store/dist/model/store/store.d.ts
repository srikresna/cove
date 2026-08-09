import { type ServiceProvider } from '@blocksuite/global/di';
import { DisposableGroup } from '@blocksuite/global/disposable';
import { Subject } from 'rxjs';
import * as Y from 'yjs';
import type { ExtensionType } from '../../extension/extension.js';
import { type Doc, HistoryExtension } from '../../extension/index.js';
import { Schema } from '../../schema/index.js';
import type { TransformerMiddleware } from '../../transformer/middleware.js';
import { Transformer } from '../../transformer/transformer.js';
import { Block, type BlockModel, type BlockProps, type BlockSysProps, type PropsOfModel } from '../block/index.js';
import { type Query } from './query.js';
export type StoreOptions = {
    doc: Doc;
    id?: string;
    readonly?: boolean;
    query?: Query;
    provider?: ServiceProvider;
    extensions?: ExtensionType[];
};
type StoreBlockAddedPayload = {
    /**
     * The type of the event.
     */
    type: 'add';
    /**
     * The id of the block.
     */
    id: string;
    /**
     * Whether the event is triggered by local changes.
     */
    isLocal: boolean;
    /**
     * The flavour of the block.
     */
    flavour: string;
    /**
     * The model of the block.
     */
    model: BlockModel;
    /**
     * @internal
     * Whether the event is triggered by initialization.
     * FIXME: This seems not working as expected now.
     */
    init: boolean;
};
type StoreBlockDeletedPayload = {
    /**
     * The type of the event.
     */
    type: 'delete';
    /**
     * The id of the block.
     */
    id: string;
    /**
     * Whether the event is triggered by local changes.
     */
    isLocal: boolean;
    /**
     * The flavour of the block.
     */
    flavour: string;
    /**
     * The parent id of the block.
     */
    parent: string;
    /**
     * The model of the block.
     */
    model: BlockModel;
};
type StoreBlockUpdatedPayload = {
    /**
     * The type of the event.
     */
    type: 'update';
    /**
     * The id of the block.
     */
    id: string;
    /**
     * Whether the event is triggered by local changes.
     */
    isLocal: boolean;
    /**
     * The flavour of the block.
     */
    flavour: string;
    /**
     * The changed props of the block.
     */
    props: {
        key: string;
    };
};
type StoreBlockUpdatedPayloads = StoreBlockAddedPayload | StoreBlockDeletedPayload | StoreBlockUpdatedPayload;
/**
 * Slots for receiving events from the store.
 * All events are rxjs Subjects, you can subscribe to them like this:
 *
 * ```ts
 * store.slots.ready.subscribe(() => {
 *   console.log('store is ready');
 * });
 * ```
 *
 * You can also use rxjs operators to handle the events.
 *
 * @interface
 * @category Store
 */
export type StoreSlots = {
    /**
     * This fires after `doc.load` is called.
     * The Y.Doc is fully loaded and ready to use.
     */
    ready: Subject<void>;
    /**
     * This fires when the root block is added via API call or has just been initialized from existing ydoc.
     * useful for internal block UI components to start subscribing following up events.
     * Note that at this moment, the whole block tree may not be fully initialized yet.
     */
    rootAdded: Subject<string>;
    /**
     * This fires when the root block is deleted via API call or has just been removed from existing ydoc.
     * In most cases, you don't need to subscribe to this event.
     */
    rootDeleted: Subject<string>;
    /**
     * This fires when a block is updated via API call or has just been updated from existing ydoc.
     *
     * The payload can have three types:
     * - add: When a new block is added
     * - delete: When a block is removed
     * - update: When a block's properties are modified
     *
     */
    blockUpdated: Subject<StoreBlockUpdatedPayloads>;
    /** @internal */
    yBlockUpdated: Subject<{
        type: 'add';
        id: string;
        isLocal: boolean;
    } | {
        type: 'delete';
        id: string;
        isLocal: boolean;
    }>;
};
/**
 * Core store class that manages blocks and their lifecycle in BlockSuite
 * @remarks
 * The Store class is responsible for managing the lifecycle of blocks, handling transactions,
 * and maintaining the block tree structure.
 * A store is a piece of data created from one or a part of a Y.Doc.
 *
 * @category Store
 */
export declare class Store {
    /** @internal */
    readonly userExtensions: ExtensionType[];
    /**
     * Group of disposable resources managed by the store
     *
     * @category Store Lifecycle
     */
    disposableGroup: DisposableGroup;
    private readonly _provider;
    private _shouldTransact;
    private readonly _runQuery;
    private readonly _doc;
    private readonly _blocks;
    private readonly _crud;
    private readonly _query;
    private readonly _readonly;
    private readonly _isEmpty;
    private readonly _schema;
    /**
     * Get the id of the store.
     *
     * @category Store Lifecycle
     */
    get id(): string;
    /**
     * {@inheritDoc StoreSlots}
     *
     * @category Store Lifecycle
     */
    readonly slots: StoreSlots;
    private get _yBlocks();
    /**
     * Get the {@link AwarenessStore} instance for current store
     */
    get awarenessStore(): import("../../index.js").AwarenessStore;
    /**
     * Get the di provider for current store.
     *
     * @category Extension
     */
    get provider(): ServiceProvider;
    /**
     * Get the {@link BlobEngine} instance for current store.
     */
    get blobSync(): import("@blocksuite/sync").BlobEngine;
    /**
     * Get the {@link Doc} instance for current store.
     */
    get doc(): Doc;
    /**
     * @internal
     */
    get blocks(): import("@preact/signals-core").Signal<Record<string, Block>>;
    /**
     * Get the number of blocks in the store
     *
     * @category Block CRUD
     */
    get blockSize(): number;
    /**
     * Check if the store can redo
     *
     * @category History
     */
    get canRedo(): boolean;
    /**
     * Check if the store can undo
     *
     * @category History
     */
    get canUndo(): boolean;
    /**
     * Undo the last transaction.
     *
     * @category History
     */
    undo: () => void;
    /**
     * Redo the last undone transaction.
     *
     * @category History
     */
    redo: () => void;
    /**
     * Reset the history of the store.
     *
     * @category History
     */
    resetHistory: () => void;
    /**
     * Execute a transaction.
     *
     * @example
     * ```ts
     * store.transact(() => {
     *   op1();
     *   op2();
     * });
     * ```
     *
     * @category History
     */
    transact(fn: () => void, shouldTransact?: boolean): void;
    /**
     * Execute a transaction without capturing the history.
     *
     * @example
     * ```ts
     * store.withoutTransact(() => {
     *   op1();
     *   op2();
     * });
     * ```
     *
     * @category History
     */
    withoutTransact(fn: () => void): void;
    /**
     * Force the following history to be captured into a new stack.
     *
     * @example
     * ```ts
     * op1();
     * op2();
     * store.captureSync();
     * op3();
     *
     * store.undo(); // undo op3
     * store.undo(); // undo op1, op2
     * ```
     *
     * @category History
     */
    captureSync: () => void;
    /**
     * Get the {@link Workspace} instance for current store.
     */
    get workspace(): import("../../index.js").Workspace;
    /**
     * Get the {@link Y.UndoManager} instance for current store.
     *
     * @category History
     */
    get history(): HistoryExtension;
    /**
     * Check if there are no blocks in the store.
     *
     * @category Block CRUD
     */
    get isEmpty(): boolean;
    /**
     * Get the signal for the empty state of the store.
     *
     * @category Block CRUD
     */
    get isEmpty$(): import("@preact/signals-core").ReadonlySignal<boolean>;
    /**
     * Check if the store is loaded.
     *
     * @category Store Lifecycle
     */
    get loaded(): boolean;
    /**
     * Get the meta data of the store.
     *
     * @internal
     */
    get meta(): import("../../index.js").DocMeta | undefined;
    /**
     * Check if the store is readonly.
     *
     * @category Block CRUD
     */
    get readonly(): boolean;
    /**
     * Get the signal for the readonly state of the store.
     *
     * @category Block CRUD
     */
    get readonly$(): import("@preact/signals-core").Signal<boolean>;
    /**
     * Set the readonly state of the store.
     *
     * @category Block CRUD
     */
    set readonly(value: boolean);
    /**
     * Check if the store is ready.
     * Which means the Y.Doc is loaded and the root block is added.
     *
     * @category Store Lifecycle
     */
    get ready(): boolean;
    /**
     * Get the root block of the store.
     *
     * @category Block CRUD
     */
    get root(): BlockModel<object> | null;
    /**
     * @internal
     * Get the root Y.Doc of sub Y.Doc.
     * In the current design, store is on a sub Y.Doc, and all sub docs have the same root Y.Doc.
     */
    get rootDoc(): Y.Doc;
    /**
     * Get the {@link Schema} instance of the store.
     */
    get schema(): Schema;
    /**
     * @internal
     * Get the Y.Doc instance of the store.
     */
    get spaceDoc(): Y.Doc;
    private _isDisposed;
    private get _history();
    /**
     * @internal
     * In most cases, you don't need to use the constructor directly.
     * The store is created by the {@link Doc} instance.
     */
    constructor({ readonly, query, provider, extensions }: StoreOptions);
    private readonly _subscribeToSlots;
    private _getSiblings;
    private _onBlockAdded;
    private _onBlockRemoved;
    /**
     * Creates and adds a new block to the store
     * @param flavour - The block's flavour (type)
     * @param blockProps - Optional properties for the new block
     * @param parent - Optional parent block or parent block ID
     * @param parentIndex - Optional index position in parent's children
     * @returns The ID of the newly created block
     * @throws {BlockSuiteError} When store is in readonly mode
     *
     * @category Block CRUD
     */
    addBlock<T extends BlockModel = BlockModel>(flavour: string, blockProps?: Partial<(PropsOfModel<T> & BlockSysProps) | BlockProps>, parent?: BlockModel | string | null, parentIndex?: number): string;
    /**
     * Add multiple blocks to the store
     * @param blocks - Array of blocks to add
     * @param parent - Optional parent block or parent block ID
     * @param parentIndex - Optional index position in parent's children
     * @returns Array of IDs of the newly created blocks
     *
     * @category Block CRUD
     */
    addBlocks(blocks: Array<{
        flavour: string;
        blockProps?: Partial<BlockProps & Omit<BlockProps, 'flavour' | 'id'>>;
    }>, parent?: BlockModel | string | null, parentIndex?: number): string[];
    /**
     * Add sibling blocks to the store
     * @param targetModel - The target block model
     * @param props - Array of block properties
     * @param placement - Optional position to place the new blocks ('after' or 'before')
     * @returns Array of IDs of the newly created blocks
     *
     * @category Block CRUD
     */
    addSiblingBlocks(targetModel: BlockModel, props: Array<Partial<BlockProps>>, placement?: 'after' | 'before'): string[];
    /**
     * Updates a block's properties or executes a callback in a transaction
     * @param modelOrId - The block model or block ID to update
     * @param callBackOrProps - Either a callback function to execute or properties to update
     * @throws {BlockSuiteError} When the block is not found or schema validation fails
     *
     * @category Block CRUD
     */
    updateBlock<T extends BlockModel = BlockModel>(modelOrId: T | string, callBackOrProps: (() => void) | Partial<(PropsOfModel<T> & BlockSysProps) | BlockProps>): void;
    /**
     * Delete a block from the store
     * @param model - The block model or block ID to delete
     * @param options - Optional options for the deletion
     * @param options.bringChildrenTo - Optional block model to bring children to
     * @param options.deleteChildren - Optional flag to delete children
     *
     * @category Block CRUD
     */
    deleteBlock(model: BlockModel | string, options?: {
        bringChildrenTo?: BlockModel;
        deleteChildren?: boolean;
    }): void;
    /**
     * Gets a block by its ID
     * @param id - The block's ID
     * @returns The block instance if found, undefined otherwise
     *
     * @category Block CRUD
     */
    getBlock(id: string): Block | undefined;
    /**
     * Gets a block by its ID
     * @param id - The block's ID
     * @returns The block instance in signal if found, undefined otherwise
     *
     * @category Block CRUD
     */
    getBlock$(id: string): Block | undefined;
    /**
     * Get a model by its ID
     * @param id - The model's ID
     * @returns The model instance if found, null otherwise
     *
     * @category Block CRUD
     */
    getModelById<Model extends BlockModel = BlockModel>(id: string): Model | null;
    /**
     * Gets all blocks of specified flavour(s)
     * @param blockFlavour - Single flavour or array of flavours to filter by
     * @returns Array of matching blocks
     *
     * @category Block CRUD
     */
    getBlocksByFlavour(blockFlavour: string | string[]): Block[];
    /**
     * Get all models in the store
     * @returns Array of all models
     *
     * @category Block CRUD
     */
    getAllModels(): BlockModel<object>[];
    /**
     * Get all models of specified flavour(s)
     * @param blockFlavour - Single flavour or array of flavours to filter by
     * @returns Array of matching models
     *
     * @category Block CRUD
     */
    getModelsByFlavour(blockFlavour: string | string[]): BlockModel[];
    /**
     * Gets the parent block of a given block
     * @param target - Block model or block ID to find parent for
     * @returns The parent block model if found, null otherwise
     *
     * @category Block CRUD
     */
    getParent(target: BlockModel | string): BlockModel | null;
    /**
     * Get the previous sibling block of a given block
     * @param block - Block model or block ID to find previous sibling for
     * @returns The previous sibling block model if found, null otherwise
     *
     * @category Block CRUD
     */
    getPrev(block: BlockModel | string): BlockModel<object> | null;
    /**
     * Get all previous sibling blocks of a given block
     * @param block - Block model or block ID to find previous siblings for
     * @returns Array of previous sibling blocks if found, empty array otherwise
     *
     * @category Block CRUD
     */
    getPrevs(block: BlockModel | string): BlockModel<object>[];
    /**
     * Get the next sibling block of a given block
     * @param block - Block model or block ID to find next sibling for
     * @returns The next sibling block model if found, null otherwise
     *
     * @category Block CRUD
     */
    getNext(block: BlockModel | string): BlockModel<object> | null;
    /**
     * Get all next sibling blocks of a given block
     * @param block - Block model or block ID to find next siblings for
     * @returns Array of next sibling blocks if found, empty array otherwise
     *
     * @category Block CRUD
     */
    getNexts(block: BlockModel | string): BlockModel<object>[];
    /**
     * Check if a block exists by its ID
     * @param id - The block's ID
     * @returns True if the block exists, false otherwise
     *
     * @category Block CRUD
     */
    hasBlock(id: string): boolean;
    /**
     * Move blocks to a new parent block
     * @param blocksToMove - Array of block models to move
     * @param newParent - The new parent block model
     * @param targetSibling - Optional target sibling block model
     * @param shouldInsertBeforeSibling - Optional flag to insert before sibling
     *
     * @category Block CRUD
     */
    moveBlocks(blocksToMove: BlockModel[], newParent: BlockModel, targetSibling?: BlockModel | null, shouldInsertBeforeSibling?: boolean): void;
    /**
     * Creates a new transformer instance for the store
     * @param middlewares - Optional array of transformer middlewares
     * @returns A new Transformer instance
     *
     * @category Transformer
     */
    getTransformer(middlewares?: TransformerMiddleware[]): Transformer;
    /**
     * Get an extension instance from the store
     * @returns The extension instance
     *
     * @example
     * ```ts
     * const extension = store.get(SomeExtension);
     * ```
     *
     * @category Extension
     */
    get get(): <T>(identifier: import("@blocksuite/global/di").GeneralServiceIdentifier<T>, options?: import("@blocksuite/global/di").ResolveOptions) => T;
    /**
     * Optional get an extension instance from the store.
     * The major difference between `get` and `getOptional` is that `getOptional` will not throw an error if the extension is not found.
     *
     * @returns The extension instance
     *
     * @example
     * ```ts
     * const extension = store.getOptional(SomeExtension);
     * ```
     *
     * @category Extension
     */
    get getOptional(): <T>(identifier: import("@blocksuite/global/di").GeneralServiceIdentifier<T>, options?: import("@blocksuite/global/di").ResolveOptions) => T | null;
    /**
     * Initializes and loads the store
     * @param initFn - Optional initialization function
     * @returns The store instance
     *
     * @category Store Lifecycle
     */
    load(initFn?: () => void): this;
    /**
     * Disposes the store and releases all resources
     *
     * @category Store Lifecycle
     */
    dispose(): void;
    private _handleYBlockAdd;
    private _handleYBlockDelete;
    private _handleYEvent;
    private readonly _handleYEvents;
}
export {};
//# sourceMappingURL=store.d.ts.map