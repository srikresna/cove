export declare class Listeners<T extends EventTarget> {
    target: T;
    private readonly listeners;
    add: this['target']['addEventListener'];
    removeAll: () => void;
    constructor(target: T);
}
//# sourceMappingURL=listeners.d.ts.map