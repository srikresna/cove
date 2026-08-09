import { popupTargetFromElement } from '@blocksuite/affine-components/context-menu';
import { computed } from '@preact/signals-core';
import { html } from 'lit/static-html.js';
import { consumeTagDraftFromTableCellHost, popTagSelect, } from '../../core/component/tags/multi-tag-select.js';
import { BaseCellRenderer } from '../../core/property/index.js';
import { createFromBaseCellRenderer } from '../../core/property/renderer.js';
import { stopPropagation } from '../../core/utils/event.js';
import { createIcon } from '../../core/utils/uni-icon.js';
import { multiSelectStyle } from './cell-renderer-css.js';
import { multiSelectPropertyModelConfig } from './define.js';
export class MultiSelectCell extends BaseCellRenderer {
    constructor() {
        super(...arguments);
        this.popTagSelect = () => {
            const initialDraftText = consumeTagDraftFromTableCellHost(this);
            this.closePopup = popTagSelect(popupTargetFromElement(this), {
                name: this.cell.property.name$.value,
                options: this.options$,
                onOptionsChange: this._onOptionsChange,
                value: this._value$,
                onChange: v => {
                    this.valueSetImmediate(v);
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
            return this.value ?? [];
        });
    }
    afterEnterEditingMode() {
        if (!this.closePopup) {
            this.popTagSelect();
        }
    }
    beforeExitEditingMode() {
        requestAnimationFrame(() => {
            this.closePopup?.();
            this.closePopup = undefined;
        });
    }
    render() {
        return html `
      <div
        class="${multiSelectStyle}"
        @pointerdown="${this.isEditing$.value ? stopPropagation : undefined}"
      >
        <affine-multi-tag-view
          .value="${this._value$.value}"
          .options="${this.options$.value}"
        ></affine-multi-tag-view>
      </div>
    `;
    }
}
export const multiSelectPropertyConfig = multiSelectPropertyModelConfig.createPropertyMeta({
    icon: createIcon('MultiSelectIcon'),
    cellRenderer: {
        view: createFromBaseCellRenderer(MultiSelectCell),
    },
});
