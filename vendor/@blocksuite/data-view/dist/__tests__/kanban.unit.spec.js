import { signal } from '@preact/signals-core';
import { describe, expect, it, vi } from 'vitest';
import { DetailSelection } from '../core/detail/selection.js';
import { groupByMatchers } from '../core/group-by/define.js';
import { GroupTrait, sortByManually } from '../core/group-by/trait.js';
import { t } from '../core/logical/type-presets.js';
import { checkboxPropertyModelConfig } from '../property-presets/checkbox/define.js';
import { multiSelectPropertyModelConfig } from '../property-presets/multi-select/define.js';
import { selectPropertyModelConfig } from '../property-presets/select/define.js';
import { textPropertyModelConfig } from '../property-presets/text/define.js';
import { canGroupable, ensureKanbanGroupColumn, pickKanbanGroupColumn, resolveKanbanGroupBy, } from '../view-presets/kanban/group-by-utils.js';
import { KanbanSingleView, materializeKanbanColumns, } from '../view-presets/kanban/kanban-view-manager.js';
import { KanbanDragController } from '../view-presets/kanban/pc/controller/drag.js';
const asDataSource = (dataSource) => dataSource;
const toTestMeta = (type, config) => ({
    type,
    config: {
        kanbanGroup: config.kanbanGroup,
        propertyData: {
            default: () => config.propertyData.default(),
        },
        jsonValue: {
            type: ({ data, dataSource }) => config.jsonValue.type({
                data: data,
                dataSource,
            }),
        },
    },
});
const immutableBooleanMeta = toTestMeta('immutable-boolean', {
    ...checkboxPropertyModelConfig.config,
    kanbanGroup: {
        enabled: true,
        mutable: false,
    },
});
const createMockDataSource = (columns) => {
    const properties$ = signal(columns.map(column => column.id));
    const typeById = new Map(columns.map(column => [column.id, column.type]));
    const dataById = new Map(columns.map(column => [column.id, column.data ?? {}]));
    const services = new Map();
    const metaEntries = [
        [
            checkboxPropertyModelConfig.type,
            toTestMeta(checkboxPropertyModelConfig.type, checkboxPropertyModelConfig.config),
        ],
        [
            selectPropertyModelConfig.type,
            toTestMeta(selectPropertyModelConfig.type, selectPropertyModelConfig.config),
        ],
        [
            multiSelectPropertyModelConfig.type,
            toTestMeta(multiSelectPropertyModelConfig.type, multiSelectPropertyModelConfig.config),
        ],
        [
            textPropertyModelConfig.type,
            toTestMeta(textPropertyModelConfig.type, textPropertyModelConfig.config),
        ],
        [immutableBooleanMeta.type, immutableBooleanMeta],
    ];
    const metaByType = new Map(metaEntries);
    const asRecord = (value) => typeof value === 'object' && value != null
        ? value
        : {};
    let autoColumnId = 0;
    const dataSource = {
        properties$,
        provider: {
            getAll: () => new Map(),
        },
        serviceGetOrCreate: (key, create) => {
            if (!services.has(key)) {
                services.set(key, create());
            }
            return services.get(key);
        },
        propertyTypeGet: (propertyId) => typeById.get(propertyId),
        propertyMetaGet: (type) => metaByType.get(type),
        propertyDataGet: (propertyId) => asRecord(dataById.get(propertyId)),
        propertyDataTypeGet: (propertyId) => {
            const type = typeById.get(propertyId);
            if (!type) {
                return;
            }
            const meta = metaByType.get(type);
            if (!meta) {
                return;
            }
            return meta.config.jsonValue.type({
                data: asRecord(dataById.get(propertyId)),
                dataSource: asDataSource(dataSource),
            });
        },
        propertyAdd: (_position, ops) => {
            const type = ops?.type ?? selectPropertyModelConfig.type;
            const id = `auto-${++autoColumnId}`;
            const meta = metaByType.get(type);
            const data = meta?.config.propertyData.default() ?? {};
            typeById.set(id, type);
            dataById.set(id, data);
            properties$.value = [...properties$.value, id];
            return id;
        },
        propertyDataSet: (propertyId, data) => {
            dataById.set(propertyId, data);
        },
    };
    return dataSource;
};
const createDragController = () => {
    return new KanbanDragController({});
};
const createTestRow = (rowId) => ({
    rowId,
    cells$: signal([]),
    index$: signal(undefined),
    prev$: signal(undefined),
    next$: signal(undefined),
    delete: vi.fn(),
    move: vi.fn(),
});
const createGroupTraitHarness = (options) => {
    const dataSource = createMockDataSource([
        {
            id: 'checkbox',
            type: checkboxPropertyModelConfig.type,
        },
    ]);
    const property = {
        id: 'checkbox',
        dataType$: signal(t.boolean.instance()),
        meta$: signal({ config: {} }),
    };
    const groupProperties = options?.groupProperties ?? [
        {
            key: 'true',
            hide: false,
            manuallyCardSort: [],
        },
        {
            key: 'false',
            hide: false,
            manuallyCardSort: [],
        },
    ];
    const rows = options?.rowIds ?? [];
    const data$ = signal({
        groupProperties,
    });
    const cellValues = new Map(Object.entries(options?.values ?? {}).map(([rowId, value]) => [
        `${rowId}:checkbox`,
        value,
    ]));
    const cells = new Map();
    const cellGetOrCreate = (rowId, propertyId) => {
        const key = `${rowId}:${propertyId}`;
        const existing = cells.get(key);
        if (existing) {
            return existing;
        }
        const jsonValue$ = signal(cellValues.get(key));
        const update = (value) => {
            jsonValue$.value = value;
            cellValues.set(key, value);
        };
        const cell = {
            jsonValue$,
            jsonValueSet: vi.fn(update),
            valueSet: vi.fn(update),
        };
        cells.set(key, cell);
        return cell;
    };
    const isLocked$ = signal(false);
    const view = {
        data$,
        rows$: signal(rows.map(createTestRow)),
        isLocked$,
        lockRows: vi.fn((locked) => {
            isLocked$.value = locked;
        }),
        manager: {
            dataSource: asDataSource(dataSource),
        },
        propertyGetOrCreate: () => property,
        cellGetOrCreate,
    };
    const groupBy$ = signal({
        type: 'groupBy',
        columnId: 'checkbox',
        name: 'boolean',
        hideEmpty: false,
        sort: { desc: false },
    });
    const ops = {
        groupBySet: vi.fn(),
        sortGroup: (keys, asc) => {
            const sorted = sortByManually(keys, value => value, data$.value.groupProperties.map(value => value.key));
            return asc === false ? sorted.reverse() : sorted;
        },
        sortRow: (groupKey, groupedRows) => {
            const group = data$.value.groupProperties.find(value => value.key === groupKey);
            return sortByManually(groupedRows, row => row.rowId, group?.manuallyCardSort ?? []);
        },
        changeGroupSort: vi.fn(),
        changeRowSort: vi.fn(),
        changeGroupHide: vi.fn(),
    };
    return {
        groupTrait: new GroupTrait(groupBy$, view, ops),
        ops,
        cells,
        view,
    };
};
describe('kanban', () => {
    describe('group trait', () => {
        it('reapplies manual card order when building grouped rows', () => {
            const { groupTrait } = createGroupTraitHarness({
                groupProperties: [
                    {
                        key: 'true',
                        hide: false,
                        manuallyCardSort: ['row-2', 'row-1'],
                    },
                    {
                        key: 'false',
                        hide: false,
                        manuallyCardSort: [],
                    },
                ],
                rowIds: ['row-1', 'row-2'],
                values: {
                    'row-1': true,
                    'row-2': true,
                },
            });
            expect(groupTrait.groupsDataList$.value
                ?.find(group => group.key === 'true')
                ?.rows.map(row => row.rowId)).toEqual(['row-2', 'row-1']);
        });
        it('preserves manual group order when updating card sort', () => {
            const { groupTrait, ops, cells, view } = createGroupTraitHarness({
                groupProperties: [
                    {
                        key: 'false',
                        hide: false,
                        manuallyCardSort: ['row-1'],
                    },
                    {
                        key: 'true',
                        hide: false,
                        manuallyCardSort: ['row-2'],
                    },
                ],
                rowIds: ['row-1', 'row-2'],
                values: {
                    'row-1': false,
                    'row-2': true,
                },
            });
            expect(groupTrait.groupsDataList$.value
                ?.find(group => group.key === 'true')
                ?.rows.map(row => row.rowId)).toEqual(['row-2']);
            view.lockRows(true);
            groupTrait.moveCardTo('row-1', 'false', 'true', 'end');
            expect(view.lockRows).toHaveBeenLastCalledWith(false);
            expect(groupTrait.groupsDataList$.value
                ?.find(group => group.key === 'true')
                ?.rows.map(row => row.rowId)).toEqual(['row-2', 'row-1']);
            expect(ops.changeRowSort).toHaveBeenCalledWith(['false', 'true'], 'true', ['row-2', 'row-1']);
            expect(cells.get('row-1:checkbox')?.jsonValueSet).toHaveBeenCalledWith(true);
        });
    });
    describe('group-by define', () => {
        it('boolean group should not include ungroup bucket', () => {
            const booleanGroup = groupByMatchers.find(group => group.name === 'boolean');
            expect(booleanGroup).toBeDefined();
            const keys = booleanGroup
                .defaultKeys(t.boolean.instance())
                .map(group => group.key);
            expect(keys).toEqual(['true', 'false']);
        });
        it('boolean group should fallback invalid values to false bucket', () => {
            const booleanGroup = groupByMatchers.find(group => group.name === 'boolean');
            expect(booleanGroup).toBeDefined();
            const groups = booleanGroup.valuesGroup(undefined, t.boolean.instance());
            expect(groups).toEqual([{ key: 'false', value: false }]);
        });
    });
    describe('columns materialization', () => {
        it('appends missing properties while preserving existing order and state', () => {
            const columns = [{ id: 'status', hide: true }, { id: 'title' }];
            const next = materializeKanbanColumns(columns, [
                'title',
                'status',
                'date',
            ]);
            expect(next).toEqual([
                { id: 'status', hide: true },
                { id: 'title' },
                { id: 'date' },
            ]);
        });
        it('drops stale columns that no longer exist in data source', () => {
            const columns = [{ id: 'title' }, { id: 'removed', hide: true }];
            const next = materializeKanbanColumns(columns, ['title']);
            expect(next).toEqual([{ id: 'title' }]);
        });
        it('returns original reference when columns are already materialized', () => {
            const columns = [{ id: 'title' }, { id: 'status', hide: true }];
            const next = materializeKanbanColumns(columns, ['title', 'status']);
            expect(next).toBe(columns);
        });
    });
    describe('filtering', () => {
        const sharedFilter = {
            type: 'group',
            op: 'and',
            conditions: [
                {
                    type: 'filter',
                    left: {
                        type: 'ref',
                        name: 'status',
                    },
                    function: 'is',
                    args: [{ type: 'literal', value: 'Done' }],
                },
            ],
        };
        const sharedTitleProperty = {
            id: 'title',
            cellGetOrCreate: () => ({
                jsonValue$: {
                    value: 'Task 1',
                },
            }),
        };
        it('evaluates filters with hidden columns', () => {
            const statusProperty = {
                id: 'status',
                cellGetOrCreate: () => ({
                    jsonValue$: {
                        value: 'Done',
                    },
                }),
            };
            const view = {
                filter$: { value: sharedFilter },
                // Simulate status being hidden in current view.
                properties$: { value: [sharedTitleProperty] },
                propertiesRaw$: { value: [sharedTitleProperty, statusProperty] },
            };
            expect(KanbanSingleView.prototype.isShow.call(view, 'row-1')).toBe(true);
        });
        it('returns false when hidden filtered column does not match', () => {
            const statusProperty = {
                id: 'status',
                cellGetOrCreate: () => ({
                    jsonValue$: {
                        value: 'In Progress',
                    },
                }),
            };
            const view = {
                filter$: { value: sharedFilter },
                // Simulate status being hidden in current view.
                properties$: { value: [sharedTitleProperty] },
                propertiesRaw$: { value: [sharedTitleProperty, statusProperty] },
            };
            expect(KanbanSingleView.prototype.isShow.call(view, 'row-1')).toBe(false);
        });
    });
    describe('drag indicator', () => {
        it('shows drop preview when insert position exists', () => {
            const controller = createDragController();
            const position = {
                group: {},
                position: 'end',
            };
            controller.getInsertPosition = vi.fn().mockReturnValue(position);
            const displaySpy = vi.spyOn(controller.dropPreview, 'display');
            const removeSpy = vi.spyOn(controller.dropPreview, 'remove');
            const result = controller.showIndicator({}, undefined);
            expect(result).toBe(position);
            expect(displaySpy).toHaveBeenCalledWith(position.group, undefined, undefined);
            expect(removeSpy).not.toHaveBeenCalled();
        });
        it('removes drop preview when insert position does not exist', () => {
            const controller = createDragController();
            controller.getInsertPosition = vi.fn().mockReturnValue(undefined);
            const displaySpy = vi.spyOn(controller.dropPreview, 'display');
            const removeSpy = vi.spyOn(controller.dropPreview, 'remove');
            const result = controller.showIndicator({}, undefined);
            expect(result).toBeUndefined();
            expect(displaySpy).not.toHaveBeenCalled();
            expect(removeSpy).toHaveBeenCalledOnce();
        });
        it('forwards hovered card to drop preview for precise insertion cursor', () => {
            const controller = createDragController();
            const hoveredCard = document.createElement('affine-data-view-kanban-card');
            const positionCard = document.createElement('affine-data-view-kanban-card');
            const position = {
                group: {},
                card: positionCard,
                position: { before: true, id: 'card-id' },
            };
            controller.getInsertPosition = vi.fn().mockReturnValue(position);
            const displaySpy = vi.spyOn(controller.dropPreview, 'display');
            controller.showIndicator({}, hoveredCard);
            expect(displaySpy).toHaveBeenCalledWith(position.group, hoveredCard, position.card);
        });
    });
    describe('group-by utils', () => {
        it('allows only kanban-enabled property types to group', () => {
            const dataSource = createMockDataSource([
                { id: 'text', type: textPropertyModelConfig.type },
                { id: 'select', type: selectPropertyModelConfig.type },
                { id: 'multi-select', type: multiSelectPropertyModelConfig.type },
                { id: 'checkbox', type: checkboxPropertyModelConfig.type },
            ]);
            expect(canGroupable(asDataSource(dataSource), 'text')).toBe(false);
            expect(canGroupable(asDataSource(dataSource), 'select')).toBe(true);
            expect(canGroupable(asDataSource(dataSource), 'multi-select')).toBe(true);
            expect(canGroupable(asDataSource(dataSource), 'checkbox')).toBe(true);
        });
        it('prefers mutable group column over immutable ones', () => {
            const dataSource = createMockDataSource([
                {
                    id: 'immutable-bool',
                    type: 'immutable-boolean',
                },
                {
                    id: 'checkbox',
                    type: checkboxPropertyModelConfig.type,
                },
            ]);
            expect(pickKanbanGroupColumn(asDataSource(dataSource))).toBe('checkbox');
        });
        it('creates default status select column when no groupable column exists', () => {
            const dataSource = createMockDataSource([
                {
                    id: 'text',
                    type: textPropertyModelConfig.type,
                },
            ]);
            const statusColumnId = ensureKanbanGroupColumn(asDataSource(dataSource));
            expect(statusColumnId).toBeTruthy();
            expect(dataSource.propertyTypeGet(statusColumnId)).toBe(selectPropertyModelConfig.type);
            const options = dataSource.propertyDataGet(statusColumnId).options ?? [];
            expect(options.map(option => option.value)).toEqual([
                'Todo',
                'In Progress',
                'Done',
            ]);
        });
        it('defaults hideEmpty to true for non-option groups', () => {
            const dataSource = createMockDataSource([
                {
                    id: 'checkbox',
                    type: checkboxPropertyModelConfig.type,
                },
            ]);
            const next = resolveKanbanGroupBy(asDataSource(dataSource));
            expect(next?.columnId).toBe('checkbox');
            expect(next?.hideEmpty).toBe(true);
            expect(next?.name).toBe('boolean');
        });
        it('defaults hideEmpty to false for select grouping', () => {
            const dataSource = createMockDataSource([
                {
                    id: 'select',
                    type: selectPropertyModelConfig.type,
                },
            ]);
            const next = resolveKanbanGroupBy(asDataSource(dataSource));
            expect(next?.columnId).toBe('select');
            expect(next?.hideEmpty).toBe(false);
            expect(next?.name).toBe('select');
        });
        it('preserves sort and explicit hideEmpty when resolving groupBy', () => {
            const dataSource = createMockDataSource([
                {
                    id: 'checkbox',
                    type: checkboxPropertyModelConfig.type,
                },
            ]);
            const current = {
                type: 'groupBy',
                columnId: 'checkbox',
                name: 'boolean',
                sort: { desc: true },
                hideEmpty: true,
            };
            const next = resolveKanbanGroupBy(asDataSource(dataSource), current);
            expect(next?.columnId).toBe('checkbox');
            expect(next?.sort).toEqual({ desc: true });
            expect(next?.hideEmpty).toBe(true);
        });
        it('replaces current non-groupable column with a valid kanban column', () => {
            const dataSource = createMockDataSource([
                { id: 'text', type: textPropertyModelConfig.type },
                { id: 'checkbox', type: checkboxPropertyModelConfig.type },
            ]);
            const next = resolveKanbanGroupBy(asDataSource(dataSource), {
                type: 'groupBy',
                columnId: 'text',
                name: 'text',
            });
            expect(next?.columnId).toBe('checkbox');
            expect(next?.name).toBe('boolean');
            expect(next?.hideEmpty).toBe(true);
        });
    });
    describe('detail selection', () => {
        it('should avoid recursive selection update when exiting select edit mode', () => {
            vi.stubGlobal('requestAnimationFrame', ((cb) => {
                cb(0);
                return 0;
            }));
            try {
                let selection;
                let beforeExitCalls = 0;
                const cell = {
                    beforeEnterEditMode: () => true,
                    beforeExitEditingMode: () => {
                        beforeExitCalls += 1;
                        selection.selection = {
                            propertyId: 'status',
                            isEditing: false,
                        };
                    },
                    afterEnterEditingMode: () => { },
                    focusCell: () => true,
                    blurCell: () => true,
                    forceUpdate: () => { },
                };
                const field = {
                    isFocus$: signal(false),
                    isEditing$: signal(false),
                    cell,
                    focus: () => { },
                    blur: () => { },
                };
                const detail = {
                    querySelector: () => field,
                };
                selection = new DetailSelection(detail);
                selection.selection = {
                    propertyId: 'status',
                    isEditing: true,
                };
                selection.selection = {
                    propertyId: 'status',
                    isEditing: false,
                };
                expect(beforeExitCalls).toBe(1);
                expect(field.isEditing$.value).toBe(false);
            }
            finally {
                vi.unstubAllGlobals();
            }
        });
    });
});
