import { EdgelessLegacySlotIdentifier } from '@blocksuite/affine-block-surface';
import { MouseButton } from '@blocksuite/std/gfx';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { PanTool } from '../tools/pan-tool.js';
const mockRaf = () => {
    let callback;
    const requestAnimationFrameMock = vi
        .fn()
        .mockImplementation((cb) => {
        callback = cb;
        return 1;
    });
    const cancelAnimationFrameMock = vi.fn();
    vi.stubGlobal('requestAnimationFrame', requestAnimationFrameMock);
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrameMock);
    return {
        getCallback: () => callback,
        requestAnimationFrameMock,
        cancelAnimationFrameMock,
    };
};
const createToolFixture = (options) => {
    const applyDeltaCenter = vi.fn();
    const selectionSet = vi.fn();
    const setTool = vi.fn();
    const navigatorSettingUpdated = {
        next: vi.fn(),
    };
    const currentToolName = options?.currentToolName;
    const currentToolOption = {
        toolType: currentToolName
            ? {
                toolName: currentToolName,
            }
            : undefined,
        options: options?.currentToolOptions,
    };
    const gfx = {
        viewport: {
            zoom: 2,
            applyDeltaCenter,
        },
        selection: {
            surfaceSelections: [{ elements: ['shape-1'] }],
            set: selectionSet,
        },
        tool: {
            currentTool$: {
                peek: () => null,
            },
            currentToolOption$: {
                peek: () => currentToolOption,
            },
            setTool,
        },
        std: {
            get: (identifier) => {
                if (identifier === EdgelessLegacySlotIdentifier) {
                    return { navigatorSettingUpdated };
                }
                return null;
            },
        },
        doc: {},
    };
    const tool = new PanTool(gfx);
    return {
        applyDeltaCenter,
        navigatorSettingUpdated,
        selectionSet,
        setTool,
        tool,
    };
};
afterEach(() => {
    vi.unstubAllGlobals();
});
describe('PanTool', () => {
    test('flushes accumulated delta on dragEnd', () => {
        mockRaf();
        const { tool, applyDeltaCenter } = createToolFixture();
        tool.dragStart({ x: 100, y: 100 });
        tool.dragMove({ x: 80, y: 60 });
        tool.dragMove({ x: 70, y: 40 });
        expect(applyDeltaCenter).not.toHaveBeenCalled();
        tool.dragEnd({});
        expect(applyDeltaCenter).toHaveBeenCalledTimes(1);
        expect(applyDeltaCenter).toHaveBeenCalledWith(15, 30);
        expect(tool.panning$.value).toBe(false);
    });
    test('cancel in unmounted drops pending deltas', () => {
        mockRaf();
        const { tool, applyDeltaCenter } = createToolFixture();
        tool.dragStart({ x: 100, y: 100 });
        tool.dragMove({ x: 80, y: 60 });
        tool.unmounted();
        tool.dragEnd({});
        expect(applyDeltaCenter).not.toHaveBeenCalled();
    });
    test('middle click temporary pan restores frameNavigator with restoredAfterPan', () => {
        const { tool, navigatorSettingUpdated, selectionSet, setTool } = createToolFixture({
            currentToolName: 'frameNavigator',
            currentToolOptions: { mode: 'fit' },
        });
        const hooks = {};
        tool.eventTarget = {
            addHook: (eventName, handler) => {
                hooks[eventName] = handler;
            },
        };
        tool.mounted();
        const preventDefault = vi.fn();
        const pointerDown = hooks.pointerDown;
        const ret = pointerDown({
            raw: {
                button: MouseButton.MIDDLE,
                preventDefault,
            },
        });
        expect(ret).toBe(false);
        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(navigatorSettingUpdated.next).toHaveBeenCalledWith({
            blackBackground: false,
        });
        expect(setTool).toHaveBeenNthCalledWith(1, PanTool, {
            panning: true,
        });
        document.dispatchEvent(new PointerEvent('pointerup', { button: MouseButton.MIDDLE }));
        expect(selectionSet).toHaveBeenCalledWith([{ elements: ['shape-1'] }]);
        expect(setTool).toHaveBeenNthCalledWith(2, expect.objectContaining({
            toolName: 'frameNavigator',
        }), {
            mode: 'fit',
            restoredAfterPan: true,
        });
    });
});
