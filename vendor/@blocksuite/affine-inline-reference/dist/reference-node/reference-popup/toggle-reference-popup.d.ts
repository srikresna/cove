import type { ReferenceInfo } from '@blocksuite/affine-model';
import type { AffineTextAttributes } from '@blocksuite/affine-shared/types';
import type { BlockStdScope } from '@blocksuite/std';
import type { InlineEditor, InlineRange } from '@blocksuite/std/inline';
import { ReferencePopup } from './reference-popup';
export declare function toggleReferencePopup(std: BlockStdScope, docTitle: string, referenceInfo: ReferenceInfo, inlineEditor: InlineEditor<AffineTextAttributes>, inlineRange: InlineRange, abortController: AbortController): ReferencePopup;
//# sourceMappingURL=toggle-reference-popup.d.ts.map