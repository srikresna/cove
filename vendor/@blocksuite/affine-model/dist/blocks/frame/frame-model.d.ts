import { Bound } from '@blocksuite/global/gfx';
import type { GfxBlockElementModel, GfxCompatibleProps, GfxElementGeometry, GfxGroupCompatibleInterface, GfxModel, PointTestOptions } from '@blocksuite/std/gfx';
import { gfxGroupCompatibleSymbol } from '@blocksuite/std/gfx';
import { type Text } from '@blocksuite/store';
import { z } from 'zod';
import { type Color } from '../../themes/index.js';
export type FrameBlockProps = {
    title: Text;
    background: Color;
    childElementIds?: Record<string, boolean>;
    presentationIndex?: string;
    comments?: Record<string, boolean>;
} & GfxCompatibleProps;
export declare const FrameZodSchema: z.ZodDefault<z.ZodObject<{
    background: z.ZodUnion<[z.ZodString, z.ZodObject<{
        normal: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        normal: string;
    }, {
        normal: string;
    }>, z.ZodObject<{
        dark: z.ZodString;
        light: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        dark: string;
        light: string;
    }, {
        dark: string;
        light: string;
    }>]>;
}, "strip", z.ZodTypeAny, {
    background: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
}, {
    background: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
}>>;
export declare const FrameBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<FrameBlockProps>;
        flavour: "affine:frame";
    } & {
        version: number;
        role: "content";
        parent: string[];
        children: never[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<FrameBlockProps>) | undefined;
};
export declare const FrameBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
declare const FrameBlockModel_base: {
    new (): GfxBlockElementModel<FrameBlockProps>;
};
export declare class FrameBlockModel extends FrameBlockModel_base implements GfxElementGeometry, GfxGroupCompatibleInterface {
    [gfxGroupCompatibleSymbol]: true;
    get childElements(): GfxModel[];
    get childIds(): string[];
    get descendantElements(): GfxModel[];
    addChild(element: GfxModel): void;
    addChildren(elements: GfxModel[]): void;
    containsBound(bound: Bound): boolean;
    hasChild(element: GfxModel): boolean;
    hasDescendant(element: GfxModel): boolean;
    includesPoint(x: number, y: number, _: PointTestOptions): boolean;
    intersectsBound(selectedBound: Bound): boolean;
    removeChild(element: GfxModel): void;
    removeChildren(elements: GfxModel[]): void;
}
export {};
//# sourceMappingURL=frame-model.d.ts.map