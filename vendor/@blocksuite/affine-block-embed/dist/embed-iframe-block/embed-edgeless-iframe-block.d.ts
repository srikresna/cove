import { EmbedIframeBlockComponent } from './embed-iframe-block';
declare const EmbedEdgelessIframeBlockComponent_base: typeof EmbedIframeBlockComponent & (new (...args: any[]) => import("@blocksuite/std").GfxBlockComponent);
export declare class EmbedEdgelessIframeBlockComponent extends EmbedEdgelessIframeBlockComponent_base {
    selectedStyle$: null;
    blockDraggable: boolean;
    accessor blockContainerStyles: {
        margin: string;
        backgroundColor: string;
    };
    get edgelessSlots(): {
        readonlyUpdated: import("rxjs").Subject<boolean>;
        navigatorSettingUpdated: import("rxjs").Subject<{
            hideToolbar?: boolean;
            blackBackground?: boolean;
            fillScreen?: boolean;
        }>;
        navigatorFrameChanged: import("rxjs").Subject<import("@blocksuite/affine-model").FrameBlockModel>;
        fullScreenToggled: import("rxjs").Subject<void>;
        elementResizeStart: import("rxjs").Subject<void>;
        elementResizeEnd: import("rxjs").Subject<void>;
        toggleNoteSlicer: import("rxjs").Subject<void>;
        toolbarLocked: import("rxjs").Subject<boolean>;
    };
    connectedCallback(): void;
    renderGfxBlock(): import("lit-html").TemplateResult;
}
export declare const EmbedIframeInteraction: import("@blocksuite/store").ExtensionType;
export {};
//# sourceMappingURL=embed-edgeless-iframe-block.d.ts.map