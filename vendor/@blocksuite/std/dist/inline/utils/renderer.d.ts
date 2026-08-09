import type { BaseTextAttributes, DeltaInsert } from '@blocksuite/store';
import { type TemplateResult } from 'lit';
export declare function renderElement<TextAttributes extends BaseTextAttributes>(delta: DeltaInsert<TextAttributes>, parseAttributes: (textAttributes?: TextAttributes) => TextAttributes | undefined, selected: boolean): TemplateResult<1>;
//# sourceMappingURL=renderer.d.ts.map