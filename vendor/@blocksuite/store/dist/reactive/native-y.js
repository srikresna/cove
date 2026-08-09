import { Array as YArray, Map as YMap, Text as YText } from 'yjs';
import { Boxed } from './boxed.js';
import { isPureObject } from './is-pure-object.js';
import { Text } from './text/index.js';
export function native2Y(value, { deep = true, transform = x => x } = {}) {
    if (value instanceof Boxed) {
        return transform(value.yMap, value);
    }
    if (value instanceof Text) {
        if (value.yText.doc) {
            return transform(value.yText.clone(), value);
        }
        return transform(value.yText, value);
    }
    if (Array.isArray(value)) {
        const yArray = new YArray();
        const result = value.map(item => {
            return deep ? native2Y(item, { deep, transform }) : item;
        });
        yArray.insert(0, result);
        return transform(yArray, value);
    }
    if (isPureObject(value)) {
        const yMap = new YMap();
        Object.entries(value).forEach(([key, value]) => {
            yMap.set(key, deep ? native2Y(value, { deep, transform }) : value);
        });
        return transform(yMap, value);
    }
    return transform(value, value);
}
export function y2Native(yAbstract, { deep = true, transform = x => x } = {}) {
    if (Boxed.is(yAbstract)) {
        const data = new Boxed(yAbstract);
        return transform(data, yAbstract);
    }
    if (yAbstract instanceof YText) {
        const data = new Text(yAbstract);
        return transform(data, yAbstract);
    }
    if (yAbstract instanceof YArray) {
        const data = yAbstract
            .toArray()
            .map(item => (deep ? y2Native(item, { deep, transform }) : item));
        return transform(data, yAbstract);
    }
    if (yAbstract instanceof YMap) {
        const data = Object.fromEntries(Array.from(yAbstract.entries()).map(([key, value]) => {
            return [key, deep ? y2Native(value, { deep, transform }) : value];
        }));
        return transform(data, yAbstract);
    }
    return transform(yAbstract, yAbstract);
}
