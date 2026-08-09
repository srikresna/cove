import { createIdentifier } from '@blocksuite/global/di';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { Extension } from '@blocksuite/store';
import { GfxControllerIdentifier } from '../../identifiers.js';
export const InteractivityExtensionIdentifier = createIdentifier('interactivity-extension');
export class InteractivityExtension extends Extension {
    get std() {
        return this.gfx.std;
    }
    constructor(gfx) {
        super();
        this.gfx = gfx;
        this.event = new InteractivityEventAPI();
        this.action = new InteractivityActionAPI();
    }
    mounted() { }
    /**
     * Override this method should call `super.unmounted()`
     */
    unmounted() {
        this.event.destroy();
        this.action.destroy();
    }
    static setup(di) {
        if (!this.key) {
            throw new BlockSuiteError(ErrorCode.ValueNotExists, 'key is not defined in the InteractivityExtension');
        }
        di.add(this, [GfxControllerIdentifier]);
        di.addImpl(InteractivityExtensionIdentifier(this.key), provider => provider.get(this));
    }
}
export class InteractivityEventAPI {
    constructor() {
        this._handlersMap = new Map();
    }
    on(eventName, handler) {
        const handlers = this._handlersMap.get(eventName) ?? [];
        handlers.push(handler);
        this._handlersMap.set(eventName, handlers);
        return () => {
            const idx = handlers.indexOf(handler);
            if (idx > -1) {
                handlers.splice(idx, 1);
            }
        };
    }
    emit(eventName, evt) {
        const handlers = this._handlersMap.get(eventName);
        if (!handlers) {
            return;
        }
        for (const handler of handlers) {
            handler(evt);
        }
    }
    destroy() {
        this._handlersMap.clear();
    }
}
export class InteractivityActionAPI {
    constructor() {
        this._handlers = {};
    }
    onDragInitialize(handler) {
        this._handlers['dragInitialize'] = handler;
        return () => {
            delete this._handlers['dragInitialize'];
        };
    }
    onElementResize(handler) {
        this._handlers['elementResize'] = handler;
        return () => {
            return delete this._handlers['elementResize'];
        };
    }
    onRequestElementsClone(handler) {
        this._handlers['elementsClone'] = handler;
        return () => {
            return delete this._handlers['elementsClone'];
        };
    }
    onElementSelect(handler) {
        this._handlers['elementSelect'] = handler;
        return () => {
            return delete this._handlers['elementSelect'];
        };
    }
    emit(event, context) {
        const handler = this._handlers[event];
        return handler?.(context);
    }
    destroy() {
        for (const key in this._handlers) {
            delete this._handlers[key];
        }
    }
}
