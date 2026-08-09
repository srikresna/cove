var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { convert, derive, field, GfxLocalElementModel, GfxPrimitiveElementModel, } from '../gfx/index.js';
let TestShapeElement = (() => {
    let _classSuper = GfxPrimitiveElementModel;
    let _rotate_decorators;
    let _rotate_initializers = [];
    let _rotate_extraInitializers = [];
    let _xywh_decorators;
    let _xywh_initializers = [];
    let _xywh_extraInitializers = [];
    let _shapeType_decorators;
    let _shapeType_initializers = [];
    let _shapeType_extraInitializers = [];
    return class TestShapeElement extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _rotate_decorators = [field()];
            _xywh_decorators = [field()];
            _shapeType_decorators = [convert(val => {
                    if (['rect', 'triangle'].includes(val)) {
                        return val;
                    }
                    return 'rect';
                }), derive(val => {
                    if (val === 'triangle') {
                        return {
                            rotate: 0,
                        };
                    }
                    return {};
                }), field()];
            __esDecorate(this, null, _rotate_decorators, { kind: "accessor", name: "rotate", static: false, private: false, access: { has: obj => "rotate" in obj, get: obj => obj.rotate, set: (obj, value) => { obj.rotate = value; } }, metadata: _metadata }, _rotate_initializers, _rotate_extraInitializers);
            __esDecorate(this, null, _xywh_decorators, { kind: "accessor", name: "xywh", static: false, private: false, access: { has: obj => "xywh" in obj, get: obj => obj.xywh, set: (obj, value) => { obj.xywh = value; } }, metadata: _metadata }, _xywh_initializers, _xywh_extraInitializers);
            __esDecorate(this, null, _shapeType_decorators, { kind: "accessor", name: "shapeType", static: false, private: false, access: { has: obj => "shapeType" in obj, get: obj => obj.shapeType, set: (obj, value) => { obj.shapeType = value; } }, metadata: _metadata }, _shapeType_initializers, _shapeType_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        get type() {
            return 'testShape';
        }
        #rotate_accessor_storage = __runInitializers(this, _rotate_initializers, 0);
        get rotate() { return this.#rotate_accessor_storage; }
        set rotate(value) { this.#rotate_accessor_storage = value; }
        #xywh_accessor_storage = (__runInitializers(this, _rotate_extraInitializers), __runInitializers(this, _xywh_initializers, '[0,0,10,10]'));
        get xywh() { return this.#xywh_accessor_storage; }
        set xywh(value) { this.#xywh_accessor_storage = value; }
        #shapeType_accessor_storage = (__runInitializers(this, _xywh_extraInitializers), __runInitializers(this, _shapeType_initializers, 'rect'));
        get shapeType() { return this.#shapeType_accessor_storage; }
        set shapeType(value) { this.#shapeType_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _shapeType_extraInitializers);
        }
    };
})();
export { TestShapeElement };
export class TestLocalElement extends GfxLocalElementModel {
    constructor() {
        super(...arguments);
        this.type = 'testLocal';
    }
}
