import type { BlockLayout, TextRect } from '@blocksuite/affine-gfx-turbo-renderer';
interface ListItemLayout {
    text: string;
    rects: TextRect[];
    fontSize: number;
    type: 'bulleted' | 'numbered' | 'todo' | 'toggle';
    prefix?: string;
    checked?: boolean;
    collapsed?: boolean;
}
export interface ListLayout extends BlockLayout {
    type: 'affine:list';
    items: ListItemLayout[];
}
export declare const ListLayoutPainterExtension: import("@blocksuite/store").ExtensionType;
export {};
//# sourceMappingURL=list-painter.worker.d.ts.map