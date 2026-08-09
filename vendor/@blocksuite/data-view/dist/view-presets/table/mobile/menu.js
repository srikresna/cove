import { menu, popFilterableSimpleMenu, } from '@blocksuite/affine-components/context-menu';
import { DeleteIcon, ExpandFullIcon } from '@blocksuite/icons/lit';
export const popMobileRowMenu = (target, rowId, tableViewLogic, view) => {
    popFilterableSimpleMenu(target, [
        menu.group({
            items: [
                menu.action({
                    name: 'Expand Row',
                    prefix: ExpandFullIcon(),
                    select: () => {
                        tableViewLogic.root.openDetailPanel({
                            view: view,
                            rowId: rowId,
                        });
                    },
                }),
            ],
        }),
        menu.group({
            name: '',
            items: [
                menu.action({
                    name: 'Delete Row',
                    class: { 'delete-item': true },
                    prefix: DeleteIcon(),
                    select: () => {
                        view.rowsDelete([rowId]);
                        tableViewLogic.ui$.value?.requestUpdate();
                    },
                }),
            ],
        }),
    ]);
};
