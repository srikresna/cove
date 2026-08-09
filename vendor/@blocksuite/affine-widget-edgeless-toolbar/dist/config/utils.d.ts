import type { ToolbarContext } from '@blocksuite/affine-shared/services';
import type { BlockComponent } from '@blocksuite/std';
import type { Menu, MenuItem } from './types';
export declare function renderCurrentMenuItemWith<T, F extends keyof MenuItem<T>>(items: MenuItem<T>[], currentValue: T, field: F): MenuItem<T>[F] | undefined;
export declare function renderMenu<T>({ label, tooltip, icon, items, currentValue, onPick, }: Menu<T>): import("lit-html").TemplateResult<1>;
export declare function renderMenuItems<T>(items: MenuItem<T>[], currentValue: T, onPick: (value: T) => void): unknown;
export declare function getRootBlock(ctx: ToolbarContext): BlockComponent | null;
//# sourceMappingURL=utils.d.ts.map