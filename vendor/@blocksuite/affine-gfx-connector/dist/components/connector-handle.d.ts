import type { ConnectorElementModel } from '@blocksuite/affine-model';
import { type BlockComponent, type BlockStdScope } from '@blocksuite/std';
import type { Store } from '@blocksuite/store';
import { LitElement } from 'lit';
import type { ConnectionOverlay } from '../connector-manager';
declare const EdgelessConnectorHandle_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessConnectorHandle extends EdgelessConnectorHandle_base {
    static styles: import("lit").CSSResult;
    private _lastZoom;
    get connectionOverlay(): ConnectionOverlay;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    get slots(): {
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
    private _bindEvent;
    private _capPointerDown;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _endHandler;
    private accessor _startHandler;
    accessor connector: ConnectorElementModel;
    accessor doc: Store;
    accessor edgeless: BlockComponent;
    accessor std: BlockStdScope;
}
export {};
//# sourceMappingURL=connector-handle.d.ts.map