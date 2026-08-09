import type { BlockStdScope } from '@blocksuite/std';
export interface QuickActionConfig {
    id: string;
    hotkey?: string;
    showWhen: (std: BlockStdScope) => boolean;
    action: (std: BlockStdScope) => void;
}
export declare const quickActionConfig: QuickActionConfig[];
//# sourceMappingURL=quick-action.d.ts.map