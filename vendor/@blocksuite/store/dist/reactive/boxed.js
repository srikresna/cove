import * as Y from 'yjs';
import { NATIVE_UNIQ_IDENTIFIER } from '../consts.js';
/**
 * Boxed is to store raw data in Yjs.
 * By default, store will try to convert a object to a Y.Map.
 * If you want to store a raw object for you want to manipulate the Y.Map directly, you can use Boxed.
 *
 * > [!NOTE]
 * > Please notice that the data will be stored in Y.Map anyway so it can not hold data structure like function.
 *
 * @example
 * ```ts
 * const boxedObject = new Boxed({ a: 1, b: 2 });
 * const boxedYMap = new Boxed(new Y.Map());
 * boxedObject.getValue().a; // 1
 * boxedYMap.getValue().set('a', 1);
 * boxedObject.setValue({ foo: 'bar' });
 * ```
 *
 * @typeParam T - The type of the value stored in the Boxed.
 *
 * @category Reactive
 */
export class Boxed {
    /**
     * Create a Boxed from a Y.Map.
     * It is useful when you sync a Y.Map from remote.
     *
     * @typeParam Value - The type of the value.
     *
     * @example
     * ```ts
     * const doc1 = new Y.Doc();
     * const doc2 = new Y.Doc();
     * keepSynced(doc1, doc2);
     *
     * const data1 = doc1.getMap('data');
     * const boxed1 = new Boxed({ a: 1, b: 2 });
     * data1.set('boxed', boxed1.yMap);
     *
     * const data2 = doc2.getMap('data');
     * const boxed2 = Boxed.from<{ a: number; b: number }>(data2.get('boxed'));
     * ```
     */
    static { this.from = (map, 
    /** @internal */
    onChange) => {
        const boxed = new Boxed(map.get('value'));
        if (onChange) {
            boxed.bind(onChange);
        }
        return boxed;
    }; }
    /**
     * Check if a value is a Boxed.
     *
     * @example
     * ```ts
     * const doc = new Y.Doc();
     *
     * const data = doc.getMap('data');
     * const boxed = new Boxed({ a: 1, b: 2 });
     * Boxed.is(boxed); // true
     *
     * data.set('boxed', boxed.yMap);
     * Boxed.is(data.get('boxed)); // true
     * ```
     */
    static { this.is = (value) => {
        return (value instanceof Y.Map && value.get('type') === NATIVE_UNIQ_IDENTIFIER);
    }; }
    /** @internal */
    get yMap() {
        return this._map;
    }
    constructor(value) {
        /**
         * Get the current value of the Boxed.
         */
        this.getValue = () => {
            return this._map.get('value');
        };
        /**
         * Replace the current value of the Boxed.
         *
         * @param value - The new value to set.
         */
        this.setValue = (value) => {
            return this._map.set('value', value);
        };
        if (value instanceof Y.Map &&
            value.doc &&
            value.get('type') === NATIVE_UNIQ_IDENTIFIER) {
            this._map = value;
        }
        else {
            this._map = new Y.Map();
            this._map.set('type', NATIVE_UNIQ_IDENTIFIER);
            this._map.set('value', value);
        }
        this._map.observeDeep(events => {
            events.forEach(event => {
                const isLocal = !event.transaction.origin ||
                    !this._map.doc ||
                    event.transaction.origin instanceof Y.UndoManager ||
                    event.transaction.origin.proxy
                    ? true
                    : event.transaction.origin === this._map.doc.clientID;
                this._onChange?.(this.getValue(), isLocal);
            });
        });
    }
    /** @internal */
    bind(onChange) {
        this._onChange = onChange;
    }
}
