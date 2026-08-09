import type { TemplateResult } from 'lit';
/**
 * Text primitive entries used in slash menu and format bar,
 * which are also used for registering hotkeys for converting block flavours.
 */
export interface TextConversionConfig {
    flavour: string;
    type?: string;
    name: string;
    description?: string;
    hotkey: string[] | null;
    icon: TemplateResult<1>;
    searchAlias?: string[];
}
export declare const textConversionConfigs: TextConversionConfig[];
//# sourceMappingURL=conversion.d.ts.map