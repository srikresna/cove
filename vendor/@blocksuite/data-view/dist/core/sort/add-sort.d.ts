import { type PopupTarget } from '@blocksuite/affine-components/context-menu';
import type { Middleware } from '@floating-ui/dom';
import type { SortUtils } from './utils.js';
export declare const popCreateSort: (target: PopupTarget, props: {
    sortUtils: SortUtils;
    onClose?: () => void;
    onBack?: () => void;
}, ops?: {
    middleware?: Middleware[];
}) => void;
//# sourceMappingURL=add-sort.d.ts.map