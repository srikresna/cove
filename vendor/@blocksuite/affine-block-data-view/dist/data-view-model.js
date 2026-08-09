import { arrayMove, insertPositionToIndex, } from '@blocksuite/affine-shared/utils';
import { BlockModel, BlockSchemaExtension, defineBlockSchema, } from '@blocksuite/store';
export class DataViewBlockModel extends BlockModel {
    constructor() {
        super();
    }
    applyViewsUpdate() {
        this.store.updateBlock(this, {
            views: this.props.views,
        });
    }
    deleteView(id) {
        this.store.captureSync();
        this.store.transact(() => {
            this.props.views = this.props.views.filter(v => v.id !== id);
        });
    }
    duplicateView(id) {
        const newId = this.store.workspace.idGenerator();
        this.store.transact(() => {
            const index = this.props.views.findIndex(v => v.id === id);
            const view = this.props.views[index];
            if (view) {
                this.props.views.splice(index + 1, 0, JSON.parse(JSON.stringify({ ...view, id: newId })));
            }
        });
        return newId;
    }
    moveViewTo(id, position) {
        this.store.transact(() => {
            this.props.views = arrayMove(this.props.views, v => v.id === id, arr => insertPositionToIndex(position, arr));
        });
        this.applyViewsUpdate();
    }
    updateView(id, update) {
        this.store.transact(() => {
            this.props.views = this.props.views.map(v => {
                if (v.id !== id) {
                    return v;
                }
                return { ...v, ...update(v) };
            });
        });
        this.applyViewsUpdate();
    }
}
export const DataViewBlockSchema = defineBlockSchema({
    flavour: 'affine:data-view',
    props: () => ({
        views: [],
        title: '',
        columns: [],
        cells: {},
    }),
    metadata: {
        role: 'hub',
        version: 1,
        parent: ['affine:note'],
        children: ['affine:paragraph', 'affine:list'],
    },
    toModel: () => {
        return new DataViewBlockModel();
    },
});
export const DataViewBlockSchemaExtension = BlockSchemaExtension(DataViewBlockSchema);
