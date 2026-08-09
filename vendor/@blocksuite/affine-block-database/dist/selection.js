import { KanbanViewSelectionWithTypeSchema, TableViewSelectionWithTypeSchema, } from '@blocksuite/data-view/view-presets';
import { BaseSelection, SelectionExtension } from '@blocksuite/store';
import { z } from 'zod';
const ViewSelectionSchema = z.union([
    TableViewSelectionWithTypeSchema,
    KanbanViewSelectionWithTypeSchema,
]);
const DatabaseSelectionSchema = z.object({
    blockId: z.string(),
    viewSelection: ViewSelectionSchema,
});
export class DatabaseSelection extends BaseSelection {
    static { this.group = 'note'; }
    static { this.type = 'database'; }
    get viewId() {
        return this.viewSelection.viewId;
    }
    constructor({ blockId, viewSelection, }) {
        super({
            blockId,
        });
        this.viewSelection = viewSelection;
    }
    static fromJSON(json) {
        const { blockId, viewSelection } = DatabaseSelectionSchema.parse(json);
        return new DatabaseSelection({
            blockId,
            viewSelection: viewSelection,
        });
    }
    equals(other) {
        if (!(other instanceof DatabaseSelection)) {
            return false;
        }
        return this.blockId === other.blockId;
    }
    toJSON() {
        return {
            type: 'database',
            blockId: this.blockId,
            viewSelection: this.viewSelection,
        };
    }
}
export const DatabaseSelectionExtension = SelectionExtension(DatabaseSelection);
