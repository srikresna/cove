import { menu, popFilterableSimpleMenu, } from '@blocksuite/affine-components/context-menu';
import { ArrowRightBigIcon, DeleteIcon, ExpandFullIcon, MoveLeftIcon, MoveRightIcon, } from '@blocksuite/icons/lit';
import { html } from 'lit';
import { groupTraitKey } from '../../../core/group-by/trait.js';
export const popCardMenu = (ele, groupKey, cardId, kanbanViewLogic) => {
    const groupTrait = kanbanViewLogic.view.traitGet(groupTraitKey);
    if (!groupTrait) {
        return;
    }
    const groups = (groupTrait.groupsDataList$.value ?? []).filter((v) => v != null);
    popFilterableSimpleMenu(ele, [
        menu.group({
            items: [
                menu.action({
                    name: 'Expand Card',
                    prefix: ExpandFullIcon(),
                    select: () => {
                        kanbanViewLogic.root.openDetailPanel({
                            view: kanbanViewLogic.view,
                            rowId: cardId,
                        });
                    },
                }),
            ],
        }),
        menu.group({
            items: [
                menu.subMenu({
                    name: 'Move To',
                    prefix: ArrowRightBigIcon(),
                    options: {
                        items: groups
                            .filter(v => v.key !== groupKey)
                            .map(group => menu.action({
                            name: group.value != null ? group.name$.value : 'Ungroup',
                            select: () => {
                                groupTrait.moveCardTo(cardId, groupKey, group.key, 'start');
                            },
                        })) ?? [],
                    },
                }),
            ],
        }),
        menu.group({
            name: '',
            items: [
                menu.action({
                    name: 'Insert Before',
                    prefix: html ` <div
            style="transform: rotate(90deg);display:flex;align-items:center;"
          >
            ${MoveLeftIcon()}
          </div>`,
                    select: () => {
                        kanbanViewLogic.view.addCard({ before: true, id: cardId }, groupKey);
                        kanbanViewLogic.ui$.value?.requestUpdate();
                    },
                }),
                menu.action({
                    name: 'Insert After',
                    prefix: html ` <div
            style="transform: rotate(90deg);display:flex;align-items:center;"
          >
            ${MoveRightIcon()}
          </div>`,
                    select: () => {
                        kanbanViewLogic.view.addCard({ before: false, id: cardId }, groupKey);
                        kanbanViewLogic.ui$.value?.requestUpdate();
                    },
                }),
            ],
        }),
        menu.group({
            items: [
                menu.action({
                    name: 'Delete Card',
                    class: {
                        'delete-item': true,
                    },
                    prefix: DeleteIcon(),
                    select: () => {
                        kanbanViewLogic.view.rowsDelete([cardId]);
                        kanbanViewLogic.ui$.value?.requestUpdate();
                    },
                }),
            ],
        }),
    ]);
};
