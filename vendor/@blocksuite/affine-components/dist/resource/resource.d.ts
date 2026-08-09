import type { Disposable } from '@blocksuite/global/disposable';
import type { BlobEngine, BlobState } from '@blocksuite/sync';
import { type ReadonlySignal } from '@preact/signals-core';
import type { TemplateResult } from 'lit-html';
export type ResourceKind = 'Blob' | 'File' | 'Image';
export type StateKind = 'loading' | 'uploading' | 'error' | 'error:oversize' | 'none';
export type StateInfo = {
    icon: TemplateResult;
    title?: string;
    description?: string | null;
};
export type ResolvedStateInfoPart = {
    loading: boolean;
    error: boolean;
    state: StateKind;
    url: string | null;
    needUpload: boolean;
};
export type ResolvedStateInfo = StateInfo & ResolvedStateInfoPart;
export declare class ResourceController implements Disposable {
    readonly blobId$: ReadonlySignal<string | undefined>;
    readonly kind: ResourceKind;
    readonly blobUrl$: import("@preact/signals-core").Signal<string | null>;
    readonly state$: import("@preact/signals-core").Signal<Partial<BlobState>>;
    readonly resolvedState$: ReadonlySignal<ResolvedStateInfoPart>;
    private engine?;
    constructor(blobId$: ReadonlySignal<string | undefined>, kind?: ResourceKind);
    setEngine(engine: BlobEngine): this;
    determineState(hasExceeded: boolean, hasError: boolean, uploading: boolean, downloading: boolean): StateKind;
    resolveStateWith(info: {
        loadingIcon: TemplateResult;
        errorIcon?: TemplateResult;
    } & StateInfo): ResolvedStateInfo;
    updateState(state: Partial<BlobState>): void;
    subscribe(): () => void;
    blob(): Promise<Blob | null>;
    createUrlWith(type?: string): Promise<string | null>;
    refreshUrlWith(type?: string): Promise<void>;
    upload(): Promise<boolean | null | undefined>;
    dispose(): void;
}
//# sourceMappingURL=resource.d.ts.map