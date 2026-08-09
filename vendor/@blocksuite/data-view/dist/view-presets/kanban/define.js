import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { viewType } from '../../core/view/data-view.js';
import { resolveKanbanGroupBy } from './group-by-utils.js';
import { KanbanSingleView } from './kanban-view-manager.js';
export const kanbanViewType = viewType('kanban');
export const kanbanViewModel = kanbanViewType.createModel({
    defaultName: 'Kanban View',
    dataViewManager: KanbanSingleView,
    defaultData: viewManager => {
        const groupBy = resolveKanbanGroupBy(viewManager.dataSource);
        if (!groupBy) {
            throw new BlockSuiteError(ErrorCode.DatabaseBlockError, 'no groupable column found');
        }
        const columns = viewManager.dataSource.properties$.value;
        return {
            columns: columns.map(id => ({
                id: id,
            })),
            filter: {
                type: 'group',
                op: 'and',
                conditions: [],
            },
            groupBy,
            header: {
                titleColumn: viewManager.dataSource.properties$.value.find(id => viewManager.dataSource.propertyTypeGet(id) === 'title'),
                iconColumn: 'type',
            },
            groupProperties: [],
        };
    },
});
