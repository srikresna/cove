import { type SurfaceBlockModel } from '@blocksuite/affine-block-surface';
import { Bound } from '@blocksuite/global/gfx';
import type { BlockStdScope } from '@blocksuite/std';
import { type BlockSnapshot, type DocSnapshot, type Transformer } from '@blocksuite/store';
import { Subject } from 'rxjs';
/**
 * Template type will affect the inserting behaviour
 */
declare const TEMPLATE_TYPES: readonly ["template", "sticker"];
type TemplateType = (typeof TEMPLATE_TYPES)[number];
export type SlotBlockPayload = {
    type: 'block';
    data: {
        blockJson: BlockSnapshot;
        parent?: string;
        index?: number;
    };
};
export type SlotPayload = SlotBlockPayload | {
    type: 'template';
    template: DocSnapshot;
    bound: Bound | null;
};
export type TemplateJobConfig = {
    model: SurfaceBlockModel;
    type: string;
    middlewares: ((job: TemplateJob) => void)[];
};
export declare class TemplateJob {
    static middlewares: ((job: TemplateJob) => void)[];
    private _template;
    job: Transformer;
    model: SurfaceBlockModel;
    slots: {
        beforeInsert: Subject<SlotBlockPayload | {
            type: "template";
            template: DocSnapshot;
            bound: Bound | null;
        }>;
    };
    type: TemplateType;
    constructor({ model, type, middlewares }: TemplateJobConfig);
    static create(options: {
        model: SurfaceBlockModel;
        type: string;
        middlewares: ((job: TemplateJob) => void)[];
    }): TemplateJob;
    private _getMergeBlockId;
    private _getTemplateBound;
    private _insertToDoc;
    private _jsonToModelData;
    private _mergeProps;
    private _mergeSurfaceElements;
    insertTemplate(template: unknown): Promise<Bound | null>;
    walk(callback: (block: BlockSnapshot, template: DocSnapshot) => void): void;
}
export declare function createTemplateJob(std: BlockStdScope, type: 'template' | 'sticker', center?: {
    x: number;
    y: number;
}): TemplateJob;
export {};
//# sourceMappingURL=template.d.ts.map