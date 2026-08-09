import type { ColorScheme } from '@blocksuite/affine-model';
import { type DisposableClass } from '@blocksuite/global/lit';
import type { Constructor } from '@blocksuite/global/utils';
import type { BlockComponent } from '@blocksuite/std';
import { type GfxController, type ToolController, type ToolOptionWithType, type ToolType } from '@blocksuite/std/gfx';
import type { LitElement } from 'lit';
import { type EdgelessToolbarSlots } from '../context';
import { createPopper, type MenuPopper } from '../create-popper';
import type { EdgelessToolbarWidget } from '../edgeless-toolbar';
export declare abstract class EdgelessToolbarToolClass extends DisposableClass {
    active: boolean;
    createPopper: typeof createPopper;
    edgeless: BlockComponent;
    edgelessTool: ToolOptionWithType;
    enableActiveBackground?: boolean;
    popper: MenuPopper<HTMLElement> | null;
    setEdgelessTool: ToolController['setTool'];
    gfx: GfxController;
    theme: ColorScheme;
    toolbarContainer: HTMLElement | null;
    toolbarSlots: EdgelessToolbarSlots;
    /**
     * @return true if operation was successful
     */
    tryDisposePopper: () => boolean;
    abstract type: ToolType | ToolType[];
    accessor toolbar: EdgelessToolbarWidget;
}
export declare const EdgelessToolbarToolMixin: <T extends Constructor<LitElement>>(SuperClass: T) => T & Constructor<EdgelessToolbarToolClass>;
//# sourceMappingURL=tool.mixin.d.ts.map