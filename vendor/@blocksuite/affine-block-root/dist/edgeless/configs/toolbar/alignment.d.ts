import type { ToolbarContext } from '@blocksuite/affine-shared/services';
import type { Menu } from '@blocksuite/affine-widget-edgeless-toolbar';
import type { GfxModel } from '@blocksuite/std/gfx';
declare enum Alignment {
    None = 0,
    AutoArrange = 1,
    AutoResize = 2,
    Bottom = 3,
    DistributeHorizontally = 4,
    DistributeVertically = 5,
    Horizontally = 6,
    Left = 7,
    Right = 8,
    Top = 9,
    Vertically = 10
}
export declare function renderAlignmentMenu(ctx: ToolbarContext, models: GfxModel[], { label, tooltip, icon }: Pick<Menu<Alignment>, 'label' | 'tooltip' | 'icon'>, onPick?: (type: Alignment) => void): import("lit-html").TemplateResult<1>;
export {};
//# sourceMappingURL=alignment.d.ts.map