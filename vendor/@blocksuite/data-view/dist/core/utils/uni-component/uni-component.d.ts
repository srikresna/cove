import type { UniComponent, UniComponentReturn } from '@blocksuite/affine-shared/types';
import { ShadowlessElement } from '@blocksuite/std';
import type { Signal } from '@preact/signals-core';
import type { LitElement, PropertyValues, TemplateResult } from 'lit';
import { type StyleInfo } from 'lit/directives/style-map.js';
export declare const renderUniLit: <Props, Expose extends NonNullable<unknown>>(uni: UniComponent<Props, Expose> | undefined, props?: Props, options?: {
    ref?: Signal<Expose | undefined>;
    style?: Readonly<StyleInfo>;
    class?: string;
}) => TemplateResult;
export declare class UniLit<Props, Expose extends NonNullable<unknown> = NonNullable<unknown>> extends ShadowlessElement {
    static styles: import("lit").CSSResult;
    uniReturn?: UniComponentReturn<Props>;
    private _expose?;
    get expose(): Expose | undefined;
    private mount;
    private unmount;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected render(): unknown;
    protected updated(_changedProperties: PropertyValues): void;
    accessor props: Props;
    accessor ref: Signal<Expose | undefined> | undefined;
    accessor uni: UniComponent<Props, Expose> | undefined;
}
export declare const createUniComponentFromWebComponent: <T, Expose extends NonNullable<unknown> = NonNullable<unknown>>(component: typeof LitElement) => UniComponent<T, Expose>;
declare const UniAnyRender_base: typeof ShadowlessElement;
export declare class UniAnyRender<T, Expose extends NonNullable<unknown>> extends UniAnyRender_base {
    render(): TemplateResult;
    accessor expose: Expose;
    accessor props: T;
    accessor renderTemplate: (props: T, expose: Expose) => TemplateResult;
}
export declare const defineUniComponent: <T, Expose extends NonNullable<unknown>>(renderTemplate: (props: T, expose: Expose) => TemplateResult) => UniComponent<T, Expose>;
export {};
//# sourceMappingURL=uni-component.d.ts.map