import { describe, expect, test, vi } from 'vitest';
import { gfxGroupCompatibleSymbol, } from '../../gfx/model/base.js';
import { batchAddChildren, batchRemoveChildren, canSafeAddToContainer, descendantElementsImpl, getTopElements, } from '../../utils/tree.js';
const createElement = (id) => ({
    id,
    group: null,
    groups: [],
});
const createGroup = (id) => {
    const group = {
        id,
        [gfxGroupCompatibleSymbol]: true,
        group: null,
        groups: [],
        childIds: [],
        childElements: [],
        addChild(element) {
            const child = element;
            if (this.childElements.includes(element)) {
                return;
            }
            this.childElements.push(element);
            this.childIds.push(child.id);
            child.group = this;
            child.groups = [...this.groups, this];
        },
        removeChild(element) {
            const child = element;
            this.childElements = this.childElements.filter(item => item !== element);
            this.childIds = this.childIds.filter(id => id !== child.id);
            if (child.group === this) {
                child.group = null;
                child.groups = [];
            }
        },
        hasChild(element) {
            return this.childElements.includes(element);
        },
        hasDescendant(element) {
            return descendantElementsImpl(this).includes(element);
        },
    };
    return group;
};
describe('tree utils', () => {
    test('batchAddChildren prefers container.addChildren and deduplicates', () => {
        const a = createElement('a');
        const b = createElement('b');
        const container = {
            addChildren: vi.fn(),
            addChild: vi.fn(),
        };
        batchAddChildren(container, [a, a, b]);
        expect(container.addChildren).toHaveBeenCalledTimes(1);
        expect(container.addChildren).toHaveBeenCalledWith([a, b]);
        expect(container.addChild).not.toHaveBeenCalled();
    });
    test('batchRemoveChildren falls back to container.removeChild and deduplicates', () => {
        const a = createElement('a');
        const b = createElement('b');
        const container = {
            removeChild: vi.fn(),
        };
        batchRemoveChildren(container, [a, a, b]);
        expect(container.removeChild).toHaveBeenCalledTimes(2);
        expect(container.removeChild).toHaveBeenNthCalledWith(1, a);
        expect(container.removeChild).toHaveBeenNthCalledWith(2, b);
    });
    test('getTopElements removes descendants when ancestors are selected', () => {
        const root = createGroup('root');
        const nested = createGroup('nested');
        const leafA = createElement('leaf-a');
        const leafB = createElement('leaf-b');
        const leafC = createElement('leaf-c');
        root.addChild(leafA);
        root.addChild(nested);
        nested.addChild(leafB);
        const result = getTopElements([
            root,
            nested,
            leafA,
            leafB,
            leafC,
        ]);
        expect(result).toEqual([
            root,
            leafC,
        ]);
    });
    test('descendantElementsImpl stops on cyclic graph', () => {
        const groupA = createGroup('group-a');
        const groupB = createGroup('group-b');
        groupA.addChild(groupB);
        groupB.addChild(groupA);
        const descendants = descendantElementsImpl(groupA);
        expect(descendants).toHaveLength(2);
        expect(new Set(descendants).size).toBe(2);
    });
    test('canSafeAddToContainer blocks self and circular descendants', () => {
        const parent = createGroup('parent');
        const child = createGroup('child');
        const unrelated = createElement('plain');
        parent.addChild(child);
        expect(canSafeAddToContainer(parent, parent)).toBe(false);
        expect(canSafeAddToContainer(child, parent)).toBe(false);
        expect(canSafeAddToContainer(parent, unrelated)).toBe(true);
    });
});
