import { FeatureFlagService } from '@blocksuite/affine-shared/services';
import { isInsideBlockByFlavour } from '@blocksuite/affine-shared/utils';
import {} from '@blocksuite/affine-widget-slash-menu';
import { DatabaseTableViewIcon } from '@blocksuite/icons/lit';
import { ToDoListTooltip } from './tooltips';
export const dataViewSlashMenuConfig = {
    disableWhen: ({ model }) => {
        return model.flavour === 'affine:data-view';
    },
    items: [
        {
            name: 'Todo',
            searchAlias: ['todo view'],
            icon: DatabaseTableViewIcon(),
            tooltip: {
                figure: ToDoListTooltip,
                caption: 'To-do List',
            },
            group: '7_Database@1',
            when: ({ model, std }) => !isInsideBlockByFlavour(model.store, model, 'affine:edgeless-text') &&
                !!std.get(FeatureFlagService).getFlag('enable_block_query'),
            action: ({ model, std }) => {
                const { host } = std;
                const parent = host.store.getParent(model);
                if (!parent)
                    return;
                const index = parent.children.indexOf(model);
                const id = host.store.addBlock('affine:data-view', {}, host.store.getParent(model), index + 1);
                const dataViewModel = host.store.getBlock(id);
                const dataView = std.view.getBlock(dataViewModel.id);
                dataView?.dataSource.viewManager.viewAdd('table');
                if (model.text?.length === 0) {
                    model.store.deleteBlock(model);
                }
            },
        },
    ],
};
