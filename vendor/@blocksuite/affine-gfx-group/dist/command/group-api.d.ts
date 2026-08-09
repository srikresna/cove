import { type GroupElementModel } from '@blocksuite/affine-model';
import type { Command } from '@blocksuite/std';
import { type GfxModel } from '@blocksuite/std/gfx';
export declare const createGroupCommand: Command<{
    elements: GfxModel[] | string[];
}, {
    groupId: string;
}>;
export declare const createGroupFromSelectedCommand: Command<{}, {
    groupId: string;
}>;
export declare const ungroupCommand: Command<{
    group: GroupElementModel;
}, {}>;
//# sourceMappingURL=group-api.d.ts.map