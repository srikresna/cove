import type { GfxModel } from '@blocksuite/std/gfx';
import { z } from 'zod';
import type { BrushElementModel, ConnectorElementModel, GroupElementModel } from '../elements';
export type EmbedCardStyle = 'horizontal' | 'horizontalThin' | 'list' | 'vertical' | 'cube' | 'cubeThick' | 'video' | 'figma' | 'html' | 'syncedDoc' | 'pdf' | 'citation' | 'audio';
export declare const LinkPreviewDataSchema: z.ZodObject<{
    description: z.ZodNullable<z.ZodString>;
    icon: z.ZodNullable<z.ZodString>;
    image: z.ZodNullable<z.ZodString>;
    title: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string | null;
    description: string | null;
    icon: string | null;
    image: string | null;
}, {
    title: string | null;
    description: string | null;
    icon: string | null;
    image: string | null;
}>;
export type LinkPreviewData = z.infer<typeof LinkPreviewDataSchema>;
export type Connectable = Exclude<GfxModel, ConnectorElementModel | BrushElementModel | GroupElementModel>;
export type BlockMeta = {
    'meta:createdAt'?: number;
    'meta:createdBy'?: string;
    'meta:updatedAt'?: number;
    'meta:updatedBy'?: string;
};
//# sourceMappingURL=types.d.ts.map