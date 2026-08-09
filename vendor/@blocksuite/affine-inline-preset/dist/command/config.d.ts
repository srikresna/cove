import { type EditorHost } from '@blocksuite/std';
import type { TemplateResult } from 'lit';
export interface TextFormatConfig {
    id: string;
    name: string;
    icon: TemplateResult<1>;
    hotkey?: string;
    activeWhen: (host: EditorHost) => boolean;
    action: (host: EditorHost) => void;
    textChecker?: (host: EditorHost) => boolean;
}
export declare const textFormatConfigs: TextFormatConfig[];
//# sourceMappingURL=config.d.ts.map