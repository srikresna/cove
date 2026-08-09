import { TextAlign } from '@blocksuite/affine-model';
import { TextAlignCenterIcon, TextAlignLeftIcon, TextAlignRightIcon, } from '@blocksuite/icons/lit';
export const textAlignConfigs = [
    {
        textAlign: TextAlign.Left,
        name: 'Align left',
        hotkey: [`Mod-Shift-L`],
        icon: TextAlignLeftIcon(),
    },
    {
        textAlign: TextAlign.Center,
        name: 'Align center',
        hotkey: [`Mod-Shift-E`],
        icon: TextAlignCenterIcon(),
    },
    {
        textAlign: TextAlign.Right,
        name: 'Align right',
        hotkey: [`Mod-Shift-R`],
        icon: TextAlignRightIcon(),
    },
];
