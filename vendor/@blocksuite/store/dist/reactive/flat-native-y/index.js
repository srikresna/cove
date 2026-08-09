import { signal } from '@preact/signals-core';
import { Array as YArray } from 'yjs';
import { BaseReactiveYData } from '../base-reactive-data';
import { Boxed } from '../boxed';
import { ReactiveYArray } from '../proxy';
import { Text } from '../text';
import { initializeData } from './initialize';
import { createProxy } from './proxy';
import { getYEventHandler } from './y-event-handler';
export class ReactiveFlatYMap extends BaseReactiveYData {
    constructor(_ySource, _onDispose, _onChange, defaultProps) {
        super();
        this._ySource = _ySource;
        this._onDispose = _onDispose;
        this._onChange = _onChange;
        this._observer = (event) => {
            const yMap = this._ySource;
            const proxy = this._proxy;
            this._onObserve(event, () => {
                getYEventHandler({
                    yMap,
                    proxy,
                    stashed: this._stashed,
                    updateWithYjsSkip: this._updateWithYjsSkip,
                    transform: this._transform,
                    onChange: this._onChange,
                    event,
                });
            });
        };
        this._transform = (key, value, origin) => {
            const onChange = this._getPropOnChange(key);
            if (value instanceof Text) {
                value.bind(onChange);
                return value;
            }
            if (Boxed.is(origin)) {
                value.bind(onChange);
                return value;
            }
            if (origin instanceof YArray) {
                const data = new ReactiveYArray(value, origin, {
                    onChange,
                });
                return data.proxy;
            }
            return value;
        };
        this._getPropOnChange = (key) => {
            return (_, isLocal) => {
                this._onChange?.(key, isLocal);
            };
        };
        this._byPassYjs = false;
        this._getProxy = (source, root, path) => createProxy({
            yMap: this._ySource,
            base: source,
            root,
            onDispose: this._onDispose,
            shouldByPassSignal: () => this._skipNext,
            byPassSignalUpdate: this._updateWithSkip,
            shouldByPassYjs: () => this._byPassYjs,
            basePath: path,
            onChange: this._onChange,
            transform: this._transform,
            stashed: this._stashed,
            initialized: () => this._initialized,
        });
        this._updateWithYjsSkip = (fn) => {
            this._byPassYjs = true;
            fn();
            this._byPassYjs = false;
        };
        this.pop = (prop) => {
            const value = this._source[prop];
            this._stashed.delete(prop);
            this._proxy[prop] = value;
        };
        this.stash = (prop) => {
            this._stashed.add(prop);
        };
        this._initialized = false;
        const source = initializeData({
            getProxy: this._getProxy,
            transform: this._transform,
            yMap: this._ySource,
        });
        this._source = source;
        const proxy = this._getProxy(source, source);
        const initSignals = (key, value) => {
            const signalData = signal(value);
            source[`${key}$`] = signalData;
            const unsubscribe = signalData.subscribe(next => {
                if (!this._initialized) {
                    return;
                }
                this._updateWithSkip(() => {
                    proxy[key] = next;
                    this._onChange?.(key, true);
                });
            });
            const subscription = _onDispose.subscribe(() => {
                subscription.unsubscribe();
                unsubscribe();
            });
        };
        Object.entries(source).forEach(([key, value]) => {
            initSignals(key, value);
        });
        if (defaultProps) {
            Object.entries(defaultProps).forEach(([key, value]) => {
                if (!(key in proxy) && value === undefined) {
                    initSignals(key, value);
                }
            });
        }
        this._proxy = proxy;
        this._ySource.observe(this._observer);
        this._initialized = true;
        if (defaultProps) {
            Object.entries(defaultProps).forEach(([key, value]) => {
                if (key in proxy || value === undefined)
                    return;
                proxy[key] = value;
            });
        }
    }
}
