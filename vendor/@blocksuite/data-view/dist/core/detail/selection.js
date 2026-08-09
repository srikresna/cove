import { KanbanCell } from '../../view-presets/kanban/pc/cell.js';
import { RecordField } from './field.js';
const isSameDetailSelection = (current, next) => {
    if (!current && !next) {
        return true;
    }
    if (!current || !next) {
        return false;
    }
    return (current.propertyId === next.propertyId &&
        current.isEditing === next.isEditing);
};
export class DetailSelection {
    get selection() {
        return this._selection;
    }
    set selection(selection) {
        if (!selection) {
            this.onSelect();
            return;
        }
        if (selection.isEditing) {
            const container = this.getFocusCellContainer(selection);
            const cell = container?.cell;
            const isEditing = cell
                ? cell.beforeEnterEditMode()
                    ? selection.isEditing
                    : false
                : false;
            this.onSelect({
                propertyId: selection.propertyId,
                isEditing,
            });
        }
        else {
            this.onSelect(selection);
        }
    }
    constructor(viewEle) {
        this.viewEle = viewEle;
        this.onSelect = (selection) => {
            if (isSameDetailSelection(this._selection, selection)) {
                return;
            }
            const old = this._selection;
            this._selection = selection;
            if (old) {
                this.blur(old);
            }
            if (selection && isSameDetailSelection(this._selection, selection)) {
                this.focus(selection);
            }
        };
    }
    blur(selection) {
        const container = this.getFocusCellContainer(selection);
        if (!container) {
            return;
        }
        container.isFocus$.value = false;
        const cell = container.cell;
        if (selection.isEditing) {
            cell?.beforeExitEditingMode();
            if (cell?.blurCell()) {
                container.blur();
            }
            container.isEditing$.value = false;
        }
        else {
            container.blur();
        }
    }
    deleteProperty() {
        //
    }
    focus(selection) {
        const container = this.getFocusCellContainer(selection);
        if (!container) {
            return;
        }
        container.isFocus$.value = true;
        const cell = container.cell;
        if (selection.isEditing) {
            if (cell?.focusCell()) {
                container.focus();
            }
            container.isEditing$.value = true;
            requestAnimationFrame(() => {
                cell?.afterEnterEditingMode();
            });
        }
        else {
            container.focus();
        }
    }
    focusDown() {
        const selection = this.selection;
        if (!selection || selection?.isEditing) {
            return;
        }
        const nextContainer = this.getFocusCellContainer(selection)?.nextElementSibling;
        if (nextContainer instanceof KanbanCell) {
            this.selection = {
                propertyId: nextContainer.column.id,
                isEditing: false,
            };
        }
    }
    focusFirstCell() {
        const firstField = this.viewEle.querySelector('affine-data-view-record-field');
        const firstId = firstField?.column.id;
        if (firstId) {
            this.selection = {
                propertyId: firstId,
                isEditing: true,
            };
        }
    }
    focusUp() {
        const selection = this.selection;
        if (!selection || selection?.isEditing) {
            return;
        }
        const preContainer = this.getFocusCellContainer(selection)?.previousElementSibling;
        if (preContainer instanceof RecordField) {
            this.selection = {
                propertyId: preContainer.column.id,
                isEditing: false,
            };
        }
    }
    getFocusCellContainer(selection) {
        return this.viewEle.querySelector(`affine-data-view-record-field[data-column-id="${selection.propertyId}"]`);
    }
    getSelectCard(selection) {
        const { groupKey, cardId } = selection.cards[0];
        const group = this.viewEle.querySelector(`affine-data-view-kanban-group[data-key="${groupKey}"]`);
        return group?.querySelector(`affine-data-view-kanban-card[data-card-id="${cardId}"]`);
    }
}
