export declare enum Flag {
    None = 0,
    Surface = 1,
    Block = 2,
    Text = 4,
    Native = 8,
    Hovering = 16,
    Hiding = 32,
    Accepting = 64
}
export declare class Flags {
    value$: import("@preact/signals-core").Signal<Flag>;
    get value(): Flag;
    toggle(flag: Flag, activated: boolean): void;
    check(flag: Flag, value?: Flag): boolean;
    contains(flag: number, value?: Flag): boolean;
    refresh(flag: Flag): void;
    reset(): void;
    hide(): void;
    show(): void;
    isSurface(): boolean;
    isText(): boolean;
    isBlock(): boolean;
    isNative(): boolean;
    isHovering(): boolean;
    accept(): boolean;
}
//# sourceMappingURL=flags.d.ts.map