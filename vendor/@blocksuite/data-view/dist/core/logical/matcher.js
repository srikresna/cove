import { typeSystem } from './type-system.js';
export class MatcherCreator {
    createMatcher(type, data) {
        return { type, data };
    }
}
export class Matcher {
    constructor(list, _match = (type, target) => typeSystem.unify(target, type)) {
        this.list = list;
        this._match = _match;
    }
    all() {
        return this.list;
    }
    allMatched(type) {
        const result = [];
        for (const t of this.list) {
            if (this._match(t.type, type)) {
                result.push(t);
            }
        }
        return result;
    }
    allMatchedData(type) {
        const result = [];
        for (const t of this.list) {
            if (this._match(t.type, type)) {
                result.push(t.data);
            }
        }
        return result;
    }
    find(f) {
        return this.list.find(f);
    }
    findData(f) {
        return this.list.find(data => f(data.data))?.data;
    }
    isMatched(type, target) {
        return this._match(type, target);
    }
    match(type) {
        for (const t of this.list) {
            if (this._match(t.type, type)) {
                return t.data;
            }
        }
        return;
    }
}
export class Matcher_ {
    constructor(list, getType, matchFunc = (type, target) => typeSystem.unify(target, type)) {
        this.list = list;
        this.getType = getType;
        this.matchFunc = matchFunc;
    }
    all() {
        return this.list;
    }
    allMatched(type) {
        const result = [];
        for (const t of this.list) {
            const tType = this.getType(t);
            if (this.matchFunc(tType, type)) {
                result.push(t);
            }
        }
        return result;
    }
    find(f) {
        return this.list.find(f);
    }
    isMatched(type, target) {
        return this.matchFunc(type, target);
    }
    match(type) {
        for (const t of this.list) {
            const tType = this.getType(t);
            if (this.matchFunc(tType, type)) {
                return t;
            }
        }
        return;
    }
}
