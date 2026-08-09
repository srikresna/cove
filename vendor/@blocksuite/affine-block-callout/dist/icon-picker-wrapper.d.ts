import type { IconData } from '@blocksuite/affine-shared/services';
import type { UniComponent } from '@blocksuite/affine-shared/types';
import { ShadowlessElement } from '@blocksuite/std';
import { type TemplateResult } from 'lit';
export interface IconPickerWrapperProps {
    onSelect?: (iconData?: IconData) => void;
    onClose?: () => void;
}
export declare class IconPickerWrapper extends ShadowlessElement {
    iconPickerComponent?: UniComponent<IconPickerWrapperProps, any>;
    props?: IconPickerWrapperProps;
    constructor();
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'icon-picker-wrapper': IconPickerWrapper;
    }
}
//# sourceMappingURL=icon-picker-wrapper.d.ts.map