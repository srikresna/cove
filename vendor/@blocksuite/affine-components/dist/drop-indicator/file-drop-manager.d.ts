import { type DropTarget } from '@blocksuite/affine-shared/utils';
import type { IVec } from '@blocksuite/global/gfx';
import { Point } from '@blocksuite/global/gfx';
import { type BlockComponent, type BlockStdScope, type EditorHost, LifeCycleWatcher } from '@blocksuite/std';
import type { BlockModel, ExtensionType } from '@blocksuite/store';
import { DropIndicator } from './drop-indicator';
export type DropProps = {
    std: BlockStdScope;
    files: File[];
    targetModel: BlockModel | null;
    placement: 'before' | 'after';
    point: IVec;
};
export type FileDropOptions = {
    flavour: string;
    onDrop?: (props: DropProps) => boolean;
};
/**
 * Handles resources from outside.
 * Uses `drag over` to handle it.
 */
export declare class FileDropExtension extends LifeCycleWatcher {
    static readonly key = "FileDropExtension";
    indicator: DropIndicator;
    dragging$: import("@preact/signals-core").Signal<boolean>;
    point$: import("@preact/signals-core").Signal<Point | null>;
    private _disableIndicator;
    closestElement$: import("@preact/signals-core").Signal<BlockComponent<BlockModel<object>, import("@blocksuite/std").BlockService, string> | null>;
    dropTarget$: import("@preact/signals-core").ReadonlySignal<DropTarget | null>;
    getDropTargetModel(model: BlockModel | null): BlockModel<object> | null;
    shouldIgnoreEvent: (event: DragEvent, shouldCheckFiles?: boolean) => boolean;
    updatePoint: (event: DragEvent) => void;
    onDragLeave: () => void;
    onDragOver: (event: DragEvent) => void;
    onDrop: (event: DragEvent) => void;
    get doc(): import("@blocksuite/store").Store;
    get editorHost(): EditorHost;
    unmounted(): void;
    mounted(): void;
}
export declare const FileDropConfigExtension: (options: FileDropOptions) => ExtensionType;
//# sourceMappingURL=file-drop-manager.d.ts.map