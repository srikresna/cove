import { getSelectedModelsCommand } from '@blocksuite/affine-shared/commands';
import { FeatureFlagService } from '@blocksuite/affine-shared/services';
import { insertPositionToIndex, } from '@blocksuite/affine-shared/utils';
import { DataSourceBase, ViewManagerBase, } from '@blocksuite/data-view';
import { propertyPresets } from '@blocksuite/data-view/property-presets';
import { IS_MOBILE } from '@blocksuite/global/env';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import {} from '@blocksuite/store';
import { computed, signal } from '@preact/signals-core';
import { getIcon } from './block-icons.js';
import { databaseBlockProperties, databasePropertyConverts, } from './properties/index.js';
import { addProperty, copyCellsByProperty, deleteRows, deleteView, duplicateView, getCell, getProperty, moveViewTo, updateCell, updateCells, updateProperty, updateView, } from './utils/block-utils.js';
import { databaseBlockViewConverts, databaseBlockViewMap, databaseBlockViews, } from './views/index.js';
export class DatabaseBlockDataSource extends DataSourceBase {
    get parentProvider() {
        return this._model.store.provider;
    }
    isSpacialProperty(propertyType) {
        return this.spacialProperties[propertyType] !== undefined;
    }
    spacialValueGet(rowId, propertyId, propertyType) {
        return this.spacialProperties[propertyType]?.valueGet(rowId, propertyId);
    }
    static { this.externalProperties = signal([]); }
    static { this.propertiesList = computed(() => {
        return [
            ...Object.values(databaseBlockProperties),
            ...this.externalProperties.value,
        ];
    }); }
    static { this.propertiesMap = computed(() => {
        return Object.fromEntries(this.propertiesList.value.map(v => [v.type, v]));
    }); }
    get doc() {
        return this._model.store;
    }
    constructor(model, init) {
        super();
        this.spacialProperties = {
            'created-time': {
                valueSet: () => { },
                valueGet: (rowId) => {
                    const model = this.getModelById(rowId);
                    if (!model) {
                        return null;
                    }
                    return model.props['meta:createdAt'];
                },
            },
            'created-by': {
                valueSet: () => { },
                valueGet: (rowId) => {
                    const model = this.getModelById(rowId);
                    return model ? model.props['meta:createdBy'] : null;
                },
            },
            type: {
                valueSet: () => { },
                valueGet: (rowId) => {
                    const model = this.getModelById(rowId);
                    if (!model) {
                        return;
                    }
                    return getIcon(model);
                },
            },
            title: {
                valueSet: () => { },
                valueGet: (rowId) => {
                    const model = this.getModelById(rowId);
                    if (!model) {
                        return;
                    }
                    return model.text;
                },
            },
        };
        this._batch = 0;
        this.featureFlags$ = computed(() => {
            const featureFlagService = this.doc.get(FeatureFlagService);
            const enableTableVirtualScroll = featureFlagService.getFlag('enable_table_virtual_scroll');
            return {
                enable_table_virtual_scroll: enableTableVirtualScroll ?? false,
            };
        });
        this.properties$ = computed(() => {
            const fixedPropertiesSet = new Set(this.fixedProperties$.value);
            const properties = [];
            this._model.props.columns$.value.forEach(column => {
                if (fixedPropertiesSet.has(column.type)) {
                    fixedPropertiesSet.delete(column.type);
                }
                properties.push(column.id);
            });
            const result = [...fixedPropertiesSet, ...properties];
            return result;
        });
        this.readonly$ = computed(() => {
            return (this._model.store.readonly ||
                (IS_MOBILE &&
                    !this._model.store.provider
                        .get(FeatureFlagService)
                        .getFlag('enable_mobile_database_editing')));
        });
        this.rows$ = computed(() => {
            return this._model.children.map(v => v.id);
        });
        this.viewConverts = databaseBlockViewConverts;
        this.viewDataList$ = computed(() => {
            return this._model.props.views$.value;
        });
        this.viewManager = new ViewManagerBase(this);
        this.viewMetas = databaseBlockViews;
        this.allPropertyMetas$ = computed(() => {
            return DatabaseBlockDataSource.propertiesList.value;
        });
        this.propertyMetas$ = computed(() => {
            return this.allPropertyMetas$.value.filter(v => !v.config.fixed && !v.config.hide);
        });
        this._model = model; // ensure invariants first
        init?.(this); // then allow external initialisation
    }
    _runCapture() {
        if (this._batch) {
            return;
        }
        this._batch = requestAnimationFrame(() => {
            this.doc.captureSync();
            this._batch = 0;
        });
    }
    getModelById(rowId) {
        return this._model.children[this._model.childMap.value.get(rowId) ?? -1];
    }
    newPropertyName(prefix = 'Column') {
        let i = 1;
        const hasSameName = (name) => {
            return this._model.props.columns$.value.some(column => column.name === name);
        };
        while (true) {
            let name = i === 1 ? prefix : `${prefix} ${i}`;
            if (!hasSameName(name)) {
                return name;
            }
            i++;
        }
    }
    cellValueChange(rowId, propertyId, value) {
        this._runCapture();
        const type = this.propertyTypeGet(propertyId);
        if (type == null) {
            return;
        }
        const update = this.propertyMetaGet(type)?.config.rawValue.setValue;
        const old = this.cellValueGet(rowId, propertyId);
        const updateFn = update ??
            (({ setValue, newValue }) => {
                setValue(newValue);
            });
        updateFn({
            value: old,
            data: this.propertyDataGet(propertyId),
            dataSource: this,
            newValue: value,
            setValue: newValue => {
                if (this._model.props.columns$.value.some(v => v.id === propertyId)) {
                    updateCell(this._model, rowId, {
                        columnId: propertyId,
                        value: newValue,
                    });
                }
            },
        });
    }
    cellValueGet(rowId, propertyId) {
        if (this.isSpacialProperty(propertyId)) {
            return this.spacialValueGet(rowId, propertyId, propertyId);
        }
        const type = this.propertyTypeGet(propertyId);
        if (!type) {
            return;
        }
        if (this.isSpacialProperty(type)) {
            return this.spacialValueGet(rowId, propertyId, type);
        }
        const meta = this.propertyMetaGet(type);
        if (!meta) {
            return;
        }
        const rawValue = getCell(this._model, rowId, propertyId)?.value ??
            meta.config.rawValue.default();
        const schema = meta.config.rawValue.schema;
        const result = schema.safeParse(rawValue);
        if (result.success) {
            return result.data;
        }
        return;
    }
    propertyAdd(insertToPosition, ops) {
        this.doc.captureSync();
        const { type, name } = ops ?? {};
        const property = this.propertyMetaGet(type ?? propertyPresets.multiSelectPropertyConfig.type);
        if (!property) {
            return;
        }
        const result = addProperty(this._model, insertToPosition, property.create(this.newPropertyName(name)));
        return result;
    }
    getNormalPropertyAndIndex(propertyId) {
        const index = this._model.props.columns$.value.findIndex(v => v.id === propertyId);
        if (index >= 0) {
            const column = this._model.props.columns$.value[index];
            if (!column) {
                return;
            }
            return {
                column,
                index,
            };
        }
        return;
    }
    getPropertyAndIndex(propertyId) {
        const result = this.getNormalPropertyAndIndex(propertyId);
        if (result) {
            return result;
        }
        if (this.isFixedProperty(propertyId)) {
            const meta = this.propertyMetaGet(propertyId);
            if (!meta) {
                return;
            }
            const defaultData = meta.config.fixed?.defaultData ?? {};
            return {
                column: {
                    data: defaultData,
                    id: propertyId,
                    type: propertyId,
                    name: meta.config.name,
                },
                index: -1,
            };
        }
        return undefined;
    }
    updateProperty(id, updater) {
        const result = this.getPropertyAndIndex(id);
        if (!result) {
            return;
        }
        const { column: prevColumn, index } = result;
        this._model.store.transact(() => {
            if (index >= 0) {
                const result = updater(prevColumn);
                this._model.props.columns[index] = { ...prevColumn, ...result };
            }
            else {
                const result = updater(prevColumn);
                this._model.props.columns = [
                    ...this._model.props.columns,
                    { ...prevColumn, ...result },
                ];
            }
        });
        return id;
    }
    propertyDataGet(propertyId) {
        const result = this.getPropertyAndIndex(propertyId);
        if (!result) {
            return {};
        }
        return result.column.data;
    }
    propertyDataSet(propertyId, data) {
        this._runCapture();
        this.updateProperty(propertyId, () => ({ data }));
    }
    propertyDataTypeGet(propertyId) {
        const result = this.getPropertyAndIndex(propertyId);
        if (!result) {
            return;
        }
        const { column } = result;
        const meta = this.propertyMetaGet(column.type);
        if (!meta) {
            return;
        }
        return meta.config?.jsonValue.type({
            data: column.data,
            dataSource: this,
        });
    }
    propertyDelete(id) {
        if (this.isFixedProperty(id)) {
            return;
        }
        this.doc.captureSync();
        const index = this._model.props.columns.findIndex(v => v.id === id);
        if (index < 0)
            return;
        this.doc.transact(() => {
            this._model.props.columns = this._model.props.columns.filter((_, i) => i !== index);
        });
    }
    propertyDuplicate(propertyId) {
        if (this.isFixedProperty(propertyId)) {
            return;
        }
        this.doc.captureSync();
        const currentSchema = getProperty(this._model, propertyId);
        if (!currentSchema) {
            return;
        }
        const { id: copyId, ...nonIdProps } = currentSchema;
        const names = new Set(this._model.props.columns$.value.map(v => v.name));
        let index = 1;
        while (names.has(`${nonIdProps.name}(${index})`)) {
            index++;
        }
        const schema = { ...nonIdProps, name: `${nonIdProps.name}(${index})` };
        const id = addProperty(this._model, {
            before: false,
            id: propertyId,
        }, schema);
        copyCellsByProperty(this._model, copyId, id);
        return id;
    }
    propertyMetaGet(type) {
        return DatabaseBlockDataSource.propertiesMap.value[type];
    }
    propertyNameGet(propertyId) {
        if (propertyId === 'type') {
            return 'Block Type';
        }
        const result = this.getPropertyAndIndex(propertyId);
        if (!result) {
            return '';
        }
        return result.column.name;
    }
    propertyNameSet(propertyId, name) {
        this.doc.captureSync();
        this.updateProperty(propertyId, () => ({ name }));
    }
    propertyReadonlyGet(propertyId) {
        if (propertyId === 'type')
            return true;
        return false;
    }
    propertyTypeGet(propertyId) {
        if (propertyId === 'type') {
            return 'image';
        }
        const result = this.getPropertyAndIndex(propertyId);
        if (!result) {
            return;
        }
        return result.column.type;
    }
    propertyTypeSet(propertyId, toType) {
        if (this.isFixedProperty(propertyId)) {
            return;
        }
        const meta = this.propertyMetaGet(toType);
        if (!meta) {
            return;
        }
        const currentType = this.propertyTypeGet(propertyId);
        const currentData = this.propertyDataGet(propertyId);
        const rows = this.rows$.value;
        const currentCells = rows.map(rowId => this.cellValueGet(rowId, propertyId));
        const convertFunction = databasePropertyConverts.find(v => v.from === currentType && v.to === toType)?.convert;
        const result = convertFunction?.(currentData, currentCells) ?? {
            property: meta.config.propertyData.default(),
            cells: currentCells.map(() => undefined),
        };
        this.doc.captureSync();
        updateProperty(this._model, propertyId, () => ({
            type: toType,
            data: result.property,
        }));
        const cells = {};
        currentCells.forEach((value, i) => {
            if (value != null || result.cells[i] != null) {
                const rowId = rows[i];
                if (rowId) {
                    cells[rowId] = result.cells[i];
                }
            }
        });
        updateCells(this._model, propertyId, cells);
    }
    rowAdd(insertPosition) {
        this.doc.captureSync();
        const index = typeof insertPosition === 'number'
            ? insertPosition
            : insertPositionToIndex(insertPosition, this._model.children);
        return this.doc.addBlock('affine:paragraph', {}, this._model.id, index);
    }
    rowDelete(ids) {
        this.doc.captureSync();
        for (const id of ids) {
            const block = this.doc.getBlock(id);
            if (block) {
                this.doc.deleteBlock(block.model);
            }
        }
        deleteRows(this._model, ids);
    }
    rowMove(rowId, position) {
        const model = this.doc.getModelById(rowId);
        if (model) {
            const index = insertPositionToIndex(position, this._model.children);
            const target = this._model.children[index];
            if (target?.id === rowId) {
                return;
            }
            this.doc.moveBlocks([model], this._model, target);
        }
    }
    viewDataAdd(viewData) {
        this._model.store.captureSync();
        this._model.store.transact(() => {
            this._model.props.views = [...this._model.props.views, viewData];
        });
        return viewData.id;
    }
    viewDataDelete(viewId) {
        this._model.store.captureSync();
        deleteView(this._model, viewId);
    }
    viewDataDuplicate(id) {
        return duplicateView(this._model, id);
    }
    viewDataGet(viewId) {
        return this.viewDataList$.value.find(data => data.id === viewId);
    }
    viewDataMoveTo(id, position) {
        moveViewTo(this._model, id, position);
    }
    viewDataUpdate(id, updater) {
        updateView(this._model, id, updater);
    }
    viewMetaGet(type) {
        const view = databaseBlockViewMap[type];
        if (!view) {
            throw new BlockSuiteError(ErrorCode.DatabaseBlockError, `Unknown view type: ${type}`);
        }
        return view;
    }
    viewMetaGetById(viewId) {
        const view = this.viewDataGet(viewId);
        if (!view) {
            return;
        }
        return this.viewMetaGet(view.mode);
    }
}
export const databaseViewInitTemplate = (datasource, viewType) => {
    Array.from({ length: 3 }).forEach(() => {
        datasource.rowAdd('end');
    });
    datasource.viewManager.viewAdd(viewType);
};
export const convertToDatabase = (host, viewType) => {
    const [_, ctx] = host.std.command.exec(getSelectedModelsCommand, {
        types: ['block', 'text'],
    });
    const { selectedModels } = ctx;
    const firstModel = selectedModels?.[0];
    if (!firstModel)
        return;
    host.store.captureSync();
    const parentModel = host.store.getParent(firstModel);
    if (!parentModel) {
        return;
    }
    const id = host.store.addBlock('affine:database', {}, parentModel, parentModel.children.indexOf(firstModel));
    const databaseModel = host.store.getBlock(id)?.model;
    if (!databaseModel) {
        return;
    }
    const datasource = new DatabaseBlockDataSource(databaseModel);
    datasource.viewManager.viewAdd(viewType);
    host.store.moveBlocks(selectedModels, databaseModel);
    const selectionManager = host.selection;
    selectionManager.clear();
};
