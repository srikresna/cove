import { Subject } from 'rxjs';
import { LifeCycleWatcher } from '../extension/index.js';
import type { BlockComponent, WidgetComponent } from './element/index.js';
type ViewUpdateMethod = 'delete' | 'add';
export type ViewUpdatePayload = {
    id: string;
    method: ViewUpdateMethod;
    type: 'block';
    view: BlockComponent;
} | {
    id: string;
    method: ViewUpdateMethod;
    type: 'widget';
    view: WidgetComponent;
};
export declare class ViewStore extends LifeCycleWatcher {
    static readonly key = "viewStore";
    private readonly _blockMap;
    viewUpdated: Subject<ViewUpdatePayload>;
    get views(): BlockComponent<import("@blocksuite/store").BlockModel<object>, import("../index.js").BlockService, string>[];
    private readonly _fromId;
    private readonly _widgetMap;
    deleteBlock: (node: BlockComponent) => void;
    deleteWidget: (node: WidgetComponent) => void;
    getBlock: (id: string) => BlockComponent | null;
    getWidget: (widgetName: string, hostBlockId: string) => WidgetComponent | null;
    setBlock: (node: BlockComponent) => void;
    setWidget: (node: WidgetComponent) => void;
    walkThrough: (fn: (nodeView: BlockComponent, index: number, parent: BlockComponent) => undefined | null | true, blockId?: string | undefined | null) => void;
    unmounted(): void;
}
export {};
//# sourceMappingURL=view-store.d.ts.map