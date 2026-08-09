import { multiSelectPropertyType } from '../../property-presets/multi-select/define.js';
import { selectPropertyType } from '../../property-presets/select/define.js';
import { TableViewRowSelection } from './selection';
const TAG_COLUMN_TYPES = new Set([
    selectPropertyType.type,
    multiSelectPropertyType.type,
]);
export function handleCharStartEdit(options) {
    const { event, selection, getCellContainer, updateSelection, getColumn } = options;
    const target = event.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return false;
    }
    if (selection &&
        !TableViewRowSelection.is(selection) &&
        !selection.isEditing &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        event.key.length === 1) {
        const cell = getCellContainer(selection.groupKey, selection.focus.rowIndex, selection.focus.columnIndex);
        if (cell) {
            const column = getColumn(cell);
            if (column) {
                if (TAG_COLUMN_TYPES.has(column.type$.value) && cell.setTagDraft) {
                    cell.setTagDraft(event.key);
                }
                else {
                    column.valueSetFromString(cell.rowId, event.key);
                }
            }
            updateSelection({ ...selection, isEditing: true });
            event.preventDefault();
            return true;
        }
    }
    return false;
}
