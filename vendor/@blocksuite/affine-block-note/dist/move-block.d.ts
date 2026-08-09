import { type BlockStdScope } from '@blocksuite/std';
interface MoveBlockConfig {
    name: string;
    hotkey: string[];
    action: (std: BlockStdScope) => void;
}
export declare const moveBlockConfigs: MoveBlockConfig[];
export {};
//# sourceMappingURL=move-block.d.ts.map