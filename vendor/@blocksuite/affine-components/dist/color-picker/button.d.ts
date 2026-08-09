import type { Color, ColorScheme, Palette } from '@blocksuite/affine-model';
import { LitElement } from 'lit';
import type { EditorMenuButton } from '../toolbar/menu-button';
import type { PickColorEvent } from './types';
type Type = 'normal' | 'custom';
declare const EdgelessColorPickerButton_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessColorPickerButton extends EdgelessColorPickerButton_base {
    #private;
    switchToCustomTab: (e: MouseEvent) => void;
    get colorWithoutAlpha(): string;
    get customButtonStyle(): {
        '--b': string;
        '--c': string;
    };
    get isCustomColor(): boolean;
    get tabContentPadding(): string;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor originalColor: Color;
    accessor color: string;
    accessor colorPanelClass: string | undefined;
    accessor hollowCircle: boolean;
    accessor isText: boolean;
    accessor label: string;
    accessor menuButton: EditorMenuButton;
    accessor palettes: Palette[];
    accessor pick: (event: PickColorEvent) => void;
    accessor tabType: Type;
    accessor theme: ColorScheme;
    accessor tooltip: string | undefined;
    accessor enableCustomColor: boolean;
}
export {};
//# sourceMappingURL=button.d.ts.map