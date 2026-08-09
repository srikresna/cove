import { BlockModel, BlockSchemaExtension, defineBlockSchema, } from '@blocksuite/store';
import * as Y from 'yjs';
import { SurfaceBlockModel as BaseSurfaceModel } from '../gfx/index.js';
import { GfxCompatibleBlockModel, } from '../gfx/model/gfx-block-model.js';
import { TestShapeElement } from './test-gfx-element.js';
export const RootBlockSchema = defineBlockSchema({
    flavour: 'test:page',
    props: internal => ({
        title: internal.Text(),
        count: 0,
        style: {},
        items: [],
    }),
    metadata: {
        version: 2,
        role: 'root',
        children: ['test:note', 'test:surface'],
    },
});
export const RootBlockSchemaExtension = BlockSchemaExtension(RootBlockSchema);
export class RootBlockModel extends BlockModel {
}
export const NoteBlockSchema = defineBlockSchema({
    flavour: 'test:note',
    props: () => ({}),
    metadata: {
        version: 1,
        role: 'hub',
        parent: ['test:page'],
        children: ['test:heading'],
    },
});
export const NoteBlockSchemaExtension = BlockSchemaExtension(NoteBlockSchema);
export class NoteBlockModel extends BlockModel {
}
export const HeadingBlockSchema = defineBlockSchema({
    flavour: 'test:heading',
    props: internal => ({
        type: 'h1',
        text: internal.Text(),
    }),
    metadata: {
        version: 1,
        role: 'content',
        parent: ['test:note'],
    },
});
export const HeadingBlockSchemaExtension = BlockSchemaExtension(HeadingBlockSchema);
export class HeadingBlockModel extends BlockModel {
}
export const SurfaceBlockSchema = defineBlockSchema({
    flavour: 'test:surface',
    props: internal => ({
        elements: internal.Boxed(new Y.Map()),
    }),
    metadata: {
        version: 1,
        role: 'hub',
        parent: ['test:page'],
    },
    toModel: () => new SurfaceBlockModel(),
});
export const SurfaceBlockSchemaExtension = BlockSchemaExtension(SurfaceBlockSchema);
export class SurfaceBlockModel extends BaseSurfaceModel {
    _init() {
        this._extendElement({
            testShape: TestShapeElement,
        });
        super._init();
    }
}
export const TestGfxBlockSchema = defineBlockSchema({
    flavour: 'test:gfx-block',
    props: () => ({
        xywh: '[0,0,10,10]',
        rotate: 0,
        index: 'a0',
        lockedBySelf: false,
    }),
    metadata: {
        version: 1,
        role: 'content',
        parent: ['test:surface'],
    },
    toModel: () => new TestGfxBlockModel(),
});
export const TestGfxBlockSchemaExtension = BlockSchemaExtension(TestGfxBlockSchema);
export class TestGfxBlockModel extends GfxCompatibleBlockModel(BlockModel) {
}
