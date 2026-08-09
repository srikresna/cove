import { CommandManager } from '@blocksuite/std';
import { Subject } from 'rxjs';
/**
 * Mock selection class for testing
 */
class MockSelectionStore {
    constructor() {
        this._selections = [];
        this.slots = {
            changed: {
                emit: () => { },
            },
            remoteChanged: {
                emit: () => { },
            },
        };
    }
    get value() {
        return this._selections;
    }
    create(selectionClass, ...args) {
        return new selectionClass(...args);
    }
    setGroup(group, selections) {
        this._selections = this._selections.filter(s => s.group !== group);
        this._selections.push(...selections);
        return this;
    }
    set(selections) {
        this._selections = selections;
        return this;
    }
    find(type) {
        return this._selections.find(s => s instanceof type);
    }
    filter(type) {
        return this._selections.filter(s => s instanceof type);
    }
    clear() {
        this._selections = [];
        return this;
    }
    dispose() {
        this._selections = [];
    }
}
class MockViewStore {
    constructor(doc) {
        this.doc = doc;
        this._blockMap = new Map();
        this.viewUpdated = new Subject();
    }
    get views() {
        return Array.from(this._blockMap.values());
    }
    deleteBlock(node) {
        this._blockMap.delete(node.model.id);
        this.viewUpdated.next({
            id: node.model.id,
            method: 'delete',
            type: 'block',
            view: node,
        });
    }
    getBlock(id) {
        if (this._blockMap.has(id)) {
            return this._blockMap.get(id) || null;
        }
        const block = this.doc.getBlock(id);
        if (!block)
            return null;
        const mockComponent = this._createMockBlockComponent(block);
        this._blockMap.set(id, mockComponent);
        return mockComponent;
    }
    setBlock(node) {
        if (this._blockMap.has(node.model.id)) {
            this.deleteBlock(node);
        }
        this._blockMap.set(node.model.id, node);
        this.viewUpdated.next({
            id: node.model.id,
            method: 'add',
            type: 'block',
            view: node,
        });
    }
    _createMockBlockComponent(block) {
        const role = this._determineBlockRole(block);
        const mockComponent = {
            id: block.id,
            model: block,
            flavour: block.flavour,
            role,
            parentElement: null,
            children: [],
            closest: () => null,
            querySelector: () => null,
            querySelectorAll: () => [],
        };
        this._setupParentChildRelationships(mockComponent);
        return mockComponent;
    }
    _determineBlockRole(block) {
        if (block.flavour.includes('paragraph') ||
            block.flavour.includes('list') ||
            block.flavour.includes('list-item') ||
            block.flavour.includes('text')) {
            return 'content';
        }
        return 'root';
    }
    _setupParentChildRelationships(component) {
        const parentId = component.model.parentId;
        if (parentId) {
            const parentComponent = this.getBlock(parentId);
            if (parentComponent) {
                component.parentElement = parentComponent;
                if (!parentComponent.children.find(child => child.id === component.id)) {
                    parentComponent.children.push(component);
                }
            }
        }
        try {
            const childIds = component.model.children?.map((child) => typeof child === 'string' ? child : child.id) || [];
            for (const childId of childIds) {
                const childBlock = this.doc.getBlock(childId);
                if (childBlock) {
                    const childComponent = this.getBlock(childId) ||
                        this._createMockBlockComponent(childBlock);
                    if (!component.children.find(child => child.id === childComponent.id)) {
                        component.children.push(childComponent);
                        childComponent.parentElement = component;
                    }
                }
            }
        }
        catch {
            // ignore
        }
    }
    dispose() {
        this._blockMap.clear();
    }
}
/**
 * Create a test host object
 *
 * This function creates a mock host object that includes doc and command properties,
 * which can be used for testing command execution.
 *
 * Usage:
 * ```typescript
 * const doc = affine`<affine-page></affine-page>`;
 * const host = createTestHost(doc);
 *
 * // Use host.command.exec to execute commands
 * const [_, result] = host.command.exec(someCommand, {
 *   // command params
 * });
 * ```
 *
 * @param doc Document object
 * @returns Host object containing doc and command
 */
export function createTestHost(doc) {
    const std = {
        host: undefined,
        view: new MockViewStore(doc),
        command: undefined,
        selection: undefined,
    };
    const host = {
        store: doc,
        std: std,
        selection: undefined,
    };
    host.store = doc;
    host.std = std;
    std.host = host;
    std.selection = new MockSelectionStore();
    std.command = new CommandManager(std);
    // @ts-expect-error dev-only
    host.command = std.command;
    host.selection = std.selection;
    return host;
}
