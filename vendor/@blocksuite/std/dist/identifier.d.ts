import type { Command } from './command/index.js';
import type { EventOptions, UIEventHandler } from './event/index.js';
import type { BlockService, LifeCycleWatcher } from './extension/index.js';
import type { BlockStdScope } from './scope/index.js';
import type { BlockViewType } from './spec/type.js';
export declare const BlockServiceIdentifier: import("@blocksuite/global/di").ServiceIdentifier<BlockService> & (<U extends BlockService = BlockService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const BlockFlavourIdentifier: import("@blocksuite/global/di").ServiceIdentifier<{
    flavour: string;
}> & (<U extends {
    flavour: string;
} = {
    flavour: string;
}>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const CommandIdentifier: import("@blocksuite/global/di").ServiceIdentifier<Command> & (<U extends Command = Command>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const ConfigIdentifier: import("@blocksuite/global/di").ServiceIdentifier<Record<string, unknown>> & (<U extends Record<string, unknown> = Record<string, unknown>>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const BlockViewIdentifier: import("@blocksuite/global/di").ServiceIdentifier<BlockViewType> & (<U extends BlockViewType = BlockViewType>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const WidgetViewIdentifier: import("@blocksuite/global/di").ServiceIdentifier<import("lit-html/static.js").StaticValue> & (<U extends import("lit-html/static.js").StaticValue = import("lit-html/static.js").StaticValue>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const LifeCycleWatcherIdentifier: import("@blocksuite/global/di").ServiceIdentifier<LifeCycleWatcher> & (<U extends LifeCycleWatcher = LifeCycleWatcher>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const StdIdentifier: import("@blocksuite/global/di").ServiceIdentifier<BlockStdScope> & (<U extends BlockStdScope = BlockStdScope>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const KeymapIdentifier: import("@blocksuite/global/di").ServiceIdentifier<{
    getter: (std: BlockStdScope) => Record<string, UIEventHandler>;
    options?: EventOptions;
}> & (<U extends {
    getter: (std: BlockStdScope) => Record<string, UIEventHandler>;
    options?: EventOptions;
} = {
    getter: (std: BlockStdScope) => Record<string, UIEventHandler>;
    options?: EventOptions;
}>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
//# sourceMappingURL=identifier.d.ts.map