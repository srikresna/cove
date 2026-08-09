import type { EmbedIframeBlockModel } from '@blocksuite/affine-model';
import type { BlockStdScope } from '@blocksuite/std';
import { LitElement } from 'lit';
import type { EmbedIframeStatusCardOptions } from '../types';
declare const EmbedIframeErrorCard_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EmbedIframeErrorCard extends EmbedIframeErrorCard_base {
    static styles: import("lit").CSSResult;
    private _editAbortController;
    private readonly _toggleEdit;
    private readonly _handleRetry;
    render(): import("lit-html").TemplateResult<1>;
    get host(): import("@blocksuite/std").EditorHost;
    get readonly(): boolean;
    get telemetryService(): import("@blocksuite/affine-shared/services").TelemetryService | null;
    get editorMode(): import("@blocksuite/affine-model").DocMode;
    accessor _editButton: HTMLElement | null;
    accessor error: Error | null;
    accessor onRetry: () => Promise<boolean>;
    accessor model: EmbedIframeBlockModel;
    accessor std: BlockStdScope;
    accessor inSurface: boolean;
    accessor options: EmbedIframeStatusCardOptions;
}
export declare const EmbedIframeErrorIcon: import("lit-html").TemplateResult<1>;
export {};
//# sourceMappingURL=embed-iframe-error-card.d.ts.map