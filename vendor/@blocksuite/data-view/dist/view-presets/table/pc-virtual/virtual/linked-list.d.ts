export interface LinkedListNode<T = unknown> {
    value: T;
    prev: LinkedListNode<T> | null;
    next: LinkedListNode<T> | null;
    active: boolean;
    remove: () => void;
}
export declare class LinkedList<T = unknown> {
    head: LinkedListNode<T> | null;
    tail: LinkedListNode<T> | null;
    size: number;
    append(value: T): LinkedListNode<T>;
    prepend(value: T): LinkedListNode<T>;
    remove(node: LinkedListNode<T>): void;
    shift(): LinkedListNode<T> | null;
    pop(): LinkedListNode<T> | null;
    forEach(callback: (value: T, node: LinkedListNode<T>, index: number) => void): void;
    forEachReverse(callback: (value: T, node: LinkedListNode<T>, index: number) => void): void;
    find(predicate: (value: T, node: LinkedListNode<T>, index: number) => boolean): LinkedListNode<T> | null;
    clear(): void;
    isEmpty(): boolean;
    toArray(): T[];
}
//# sourceMappingURL=linked-list.d.ts.map