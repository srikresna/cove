import { EdgelessColorPickerButton } from './button';
import { EdgelessColorButton, EdgelessColorPanel, EdgelessTextColorIcon } from './color-panel';
import { EdgelessColorPicker } from './color-picker';
import { EdgelessColorCustomButton } from './custom-button';
export * from './button';
export * from './color-panel';
export * from './color-picker';
export * from './types';
export * from './utils';
export declare function effects(): void;
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-color-picker-button': EdgelessColorPickerButton;
        'edgeless-color-picker': EdgelessColorPicker;
        'edgeless-color-custom-button': EdgelessColorCustomButton;
        'edgeless-color-panel': EdgelessColorPanel;
        'edgeless-color-button': EdgelessColorButton;
        'edgeless-text-color-icon': EdgelessTextColorIcon;
    }
}
//# sourceMappingURL=index.d.ts.map