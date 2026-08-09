import { popupTargetFromElement } from '@blocksuite/affine-components/context-menu';
import { computed } from '@preact/signals-core';
import { html } from 'lit/static-html.js';
import { consumeTagDraftFromTableCellHost, popTagSelect, } from '../../core/component/tags/multi-tag-select.js';
import { BaseCellRenderer } from '../../core/property/index.js';
import { createFromBaseCellRenderer } from '../../core/property/renderer.js';
import { createIcon } from '../../core/utils/uni-icon.js';
import { selectStyle } from './cell-renderer-css.js';
import { selectPropertyModelConfig, } from './define.js';
export class SelectCell extends BaseCellRenderer {
    constructor() {
        super(...arguments);
        this.popTagSelect = () => {
            const initialDraftText = consumeTagDraftFromTableCellHost(this);
            this.closePopup = popTagSelect(popupTargetFromElement(this), {
                name: this.cell.property.name$.value,
                mode: 'single',
                options: this.options$,
                onOptionsChange: this._onOptionsChange,
                value: this._value$,
                onChange: v => {
                    this.valueSetImmediate(v[0]);
                },
                onComplete: this._editComplete,
                minWidth: 400,
                initialDraftText,
            });
        };
        this._editComplete = () => {
            this.selectCurrentCell(false);
        };
        this._onOptionsChange = (options) => {
            this.property.dataUpdate(data => {
                return {
                    ...data,
                    options,
                };
            });
        };
        this.options$ = computed(() => {
            return this.property.data$.value.options;
        });
        this._value$ = computed(() => {
            const value = this.value;
            return value ? [value] : [];
        });
    }
    afterEnterEditingMode() {
        if (!this.closePopup) {
            this.popTagSelect();
        }
    }
    beforeExitEditingMode() {
        this.closePopup?.();
        this.closePopup = undefined;
    }
    render() {
        return html `
      <div class="${selectStyle}">
        <affine-multi-tag-view
          .value="${this._value$.value}"
          .options="${this.options$.value}"
        ></affine-multi-tag-view>
      </div>
    `;
    }
}
export const selectPropertyConfig = selectPropertyModelConfig.createPropertyMeta({
    icon: createIcon('SingleSelectIcon'),
    cellRenderer: {
        view: createFromBaseCellRenderer(SelectCell),
    },
});
