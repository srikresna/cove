import { Bound } from '@blocksuite/global/gfx';
import type { GfxCompatibleProps, GfxElementGeometry } from '@blocksuite/std/gfx';
import { z } from 'zod';
import { NoteDisplayMode, type StrokeStyle } from '../../consts/note';
import { type Color } from '../../themes';
export declare const NoteZodSchema: z.ZodDefault<z.ZodObject<{
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
    displayMode: z.ZodNativeEnum<typeof NoteDisplayMode>;
    edgeless: z.ZodObject<{
        style: z.ZodObject<{
            borderRadius: z.ZodNumber;
            borderSize: z.ZodNumber;
            borderStyle: z.ZodNativeEnum<typeof StrokeStyle>;
            shadowType: z.ZodNativeEnum<typeof import("../..").NoteShadow>;
        }, "strip", z.ZodTypeAny, {
            borderRadius: number;
            borderSize: number;
            borderStyle: StrokeStyle;
            shadowType: import("../..").NoteShadow;
        }, {
            borderRadius: number;
            borderSize: number;
            borderStyle: StrokeStyle;
            shadowType: import("../..").NoteShadow;
        }>;
    }, "strip", z.ZodTypeAny, {
        style: {
            borderRadius: number;
            borderSize: number;
            borderStyle: StrokeStyle;
            shadowType: import("../..").NoteShadow;
        };
    }, {
        style: {
            borderRadius: number;
            borderSize: number;
            borderStyle: StrokeStyle;
            shadowType: import("../..").NoteShadow;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    edgeless: {
        style: {
            borderRadius: number;
            borderSize: number;
            borderStyle: StrokeStyle;
            shadowType: import("../..").NoteShadow;
        };
    };
    background: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    displayMode: NoteDisplayMode;
}, {
    edgeless: {
        style: {
            borderRadius: number;
            borderSize: number;
            borderStyle: StrokeStyle;
            shadowType: import("../..").NoteShadow;
        };
    };
    background: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    displayMode: NoteDisplayMode;
}>>;
export declare const NoteBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<NoteProps>;
        flavour: "affine:note";
    } & {
        version: number;
        role: "hub";
        parent: string[];
        children: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<NoteProps>) | undefined;
};
export declare const NoteBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
export type NoteProps = {
    background: Color;
    displayMode: NoteDisplayMode;
    edgeless: NoteEdgelessProps;
    comments?: Record<string, boolean>;
    /**
     * @deprecated
     * use `displayMode` instead
     * hidden:true -> displayMode:NoteDisplayMode.EdgelessOnly:
     *  means the note is visible only in the edgeless mode
     * hidden:false -> displayMode:NoteDisplayMode.DocAndEdgeless:
     *  means the note is visible in the doc and edgeless mode
     */
    hidden: boolean;
} & GfxCompatibleProps;
export type NoteEdgelessProps = {
    style: {
        borderRadius: number;
        borderSize: number;
        borderStyle: StrokeStyle;
        shadowType: string;
    };
    collapse?: boolean;
    collapsedHeight?: number;
    scale?: number;
};
declare const NoteBlockModel_base: {
    new (): import("@blocksuite/std/gfx").GfxBlockElementModel<NoteProps>;
};
export declare class NoteBlockModel extends NoteBlockModel_base implements GfxElementGeometry {
    private _isSelectable;
    containsBound(bounds: Bound): boolean;
    includesPoint(x: number, y: number): boolean;
    intersectsBound(bound: Bound): boolean;
    isEmpty(): boolean;
    /**
     * We define a note block as a page block if it is the first visible note
     */
    isPageBlock(): boolean;
}
export {};
//# sourceMappingURL=note-model.d.ts.map