import { ReferenceParamsSchema } from '@blocksuite/affine-model';
import { BaseSelection, SelectionExtension } from '@blocksuite/store';
import z from 'zod';
const HighlightSelectionParamsSchema = ReferenceParamsSchema.extend({
    highlight: z.boolean().optional(),
});
export class HighlightSelection extends BaseSelection {
    static { this.group = 'scene'; }
    static { this.type = 'highlight'; }
    constructor({ mode, blockIds, elementIds, highlight = true, }) {
        super({ blockId: '[scene-highlight]' });
        this.blockIds = [];
        this.elementIds = [];
        this.mode = 'page';
        this.highlight = true;
        this.mode = mode ?? 'page';
        this.blockIds = blockIds ?? [];
        this.elementIds = elementIds ?? [];
        this.highlight = highlight;
    }
    static fromJSON(json) {
        const result = HighlightSelectionParamsSchema.parse(json);
        return new HighlightSelection(result);
    }
    equals(other) {
        return (this.mode === other.mode &&
            this.blockId === other.blockId &&
            this.blockIds.length === other.blockIds.length &&
            this.elementIds.length === other.elementIds.length &&
            this.blockIds.every((id, n) => id === other.blockIds[n]) &&
            this.elementIds.every((id, n) => id === other.elementIds[n]));
    }
    toJSON() {
        return {
            type: 'highlight',
            mode: this.mode,
            blockId: this.blockId,
            blockIds: this.blockIds,
            elementIds: this.elementIds,
        };
    }
}
export const HighlightSelectionExtension = SelectionExtension(HighlightSelection);
