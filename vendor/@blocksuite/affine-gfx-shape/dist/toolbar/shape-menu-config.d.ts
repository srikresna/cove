import type { ShapeToolOption } from '@blocksuite/affine-gfx-shape';
import type { TemplateResult } from 'lit';
type Config = {
    name: ShapeToolOption['shapeName'];
    generalIcon: TemplateResult<1>;
    scribbledIcon: TemplateResult<1>;
    tooltip: string;
    disabled: boolean;
};
export declare const ShapeComponentConfig: Config[];
export declare const ShapeComponentConfigMap: Record<import("@blocksuite/affine-model").ShapeName, Config>;
export {};
//# sourceMappingURL=shape-menu-config.d.ts.map