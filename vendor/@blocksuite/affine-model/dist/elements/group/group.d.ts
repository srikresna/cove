import type { IVec, PointLocation } from '@blocksuite/global/gfx';
import { Bound } from '@blocksuite/global/gfx';
import type { BaseElementProps, GfxModel, SerializedElement } from '@blocksuite/std/gfx';
import { GfxGroupLikeElementModel } from '@blocksuite/std/gfx';
import * as Y from 'yjs';
type GroupElementProps = BaseElementProps & {
    children: Y.Map<boolean>;
    title: Y.Text;
};
export type SerializedGroupElement = SerializedElement & {
    title: string;
    children: Record<string, boolean>;
};
export declare class GroupElementModel extends GfxGroupLikeElementModel<GroupElementProps> {
    get rotate(): number;
    set rotate(_: number);
    get type(): string;
    static propsToY(props: Record<string, unknown>): GroupElementProps;
    addChild(element: GfxModel): void;
    addChildren(elements: GfxModel[]): void;
    containsBound(bound: Bound): boolean;
    getLineIntersections(start: IVec, end: IVec): PointLocation[] | null;
    removeChild(element: GfxModel): void;
    removeChildren(elements: GfxModel[]): void;
    serialize(): SerializedGroupElement;
    lock(): void;
    unlock(): void;
    accessor children: Y.Map<boolean>;
    accessor showTitle: boolean;
    accessor title: Y.Text;
}
export {};
//# sourceMappingURL=group.d.ts.map