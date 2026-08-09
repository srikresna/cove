import { BlockSelection, type Command, TextSelection } from '@blocksuite/std';
import { ImageSelection } from '../../selection';
export declare const isNothingSelectedCommand: Command<{
    currentTextSelection?: TextSelection;
    currentImageSelections?: ImageSelection[];
    currentBlockSelections?: BlockSelection[];
}, {
    isNothingSelected: boolean;
}>;
//# sourceMappingURL=is-nothing-selected.d.ts.map