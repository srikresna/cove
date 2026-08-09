import type { KanbanCardSelection } from '../../view-presets';
import type { KanbanCard } from '../../view-presets/kanban/pc/card.js';
import { RecordField } from './field.js';
type DetailViewSelection = {
    propertyId: string;
    isEditing: boolean;
};
type DetailSelectionHost = {
    querySelector: (selector: string) => unknown;
};
export declare class DetailSelection {
    private readonly viewEle;
    _selection?: DetailViewSelection;
    onSelect: (selection?: DetailViewSelection) => void;
    get selection(): DetailViewSelection | undefined;
    set selection(selection: DetailViewSelection | undefined);
    constructor(viewEle: DetailSelectionHost);
    blur(selection: DetailViewSelection): void;
    deleteProperty(): void;
    focus(selection: DetailViewSelection): void;
    focusDown(): void;
    focusFirstCell(): void;
    focusUp(): void;
    getFocusCellContainer(selection: DetailViewSelection): RecordField | undefined;
    getSelectCard(selection: KanbanCardSelection): KanbanCard | undefined;
}
export {};
//# sourceMappingURL=selection.d.ts.map