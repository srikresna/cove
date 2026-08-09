import type { BlockComponent } from '@blocksuite/std';
import type { ReactiveController } from 'lit';
export declare class VirtualPaddingController implements ReactiveController {
    private readonly block;
    readonly virtualPadding$: import("@preact/signals-core").Signal<number>;
    constructor(block: BlockComponent);
    get std(): import("@blocksuite/std").BlockStdScope;
    get host(): import("@blocksuite/std").EditorHost;
    hostConnected(): void;
}
//# sourceMappingURL=virtual-padding.d.ts.map