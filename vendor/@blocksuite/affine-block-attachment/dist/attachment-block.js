var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { CaptionedBlockComponent, SelectedStyle, } from '@blocksuite/affine-components/caption';
import { getAttachmentFileIcon, LoadingIcon, } from '@blocksuite/affine-components/icons';
import { Peekable } from '@blocksuite/affine-components/peek';
import { ResourceController, } from '@blocksuite/affine-components/resource';
import { toast } from '@blocksuite/affine-components/toast';
import { AttachmentBlockStyles, } from '@blocksuite/affine-model';
import { BlockElementCommentManager, CitationProvider, DocModeProvider, FileSizeLimitProvider, TelemetryProvider, } from '@blocksuite/affine-shared/services';
import { formatSize, openSingleFileWith, } from '@blocksuite/affine-shared/utils';
import { AttachmentIcon, ResetIcon, UpgradeIcon, WarningIcon, } from '@blocksuite/icons/lit';
import { BlockSelection } from '@blocksuite/std';
import { nanoid, Slice } from '@blocksuite/store';
import { batch, computed, signal } from '@preact/signals-core';
import { html } from 'lit';
import { choose } from 'lit/directives/choose.js';
import { classMap } from 'lit/directives/class-map.js';
import { guard } from 'lit/directives/guard.js';
import { styleMap } from 'lit/directives/style-map.js';
import { when } from 'lit/directives/when.js';
import { filter } from 'rxjs/operators';
import { AttachmentEmbedProvider } from './embed';
import { styles } from './styles';
import { downloadAttachmentBlob, getFileType, refreshData } from './utils';
let AttachmentBlockComponent = (() => {
    let _classDecorators = [Peekable({
            enableOn: ({ model }) => {
                return model.props.type.endsWith('pdf');
            },
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = CaptionedBlockComponent;
    var AttachmentBlockComponent = class extends _classSuper {
        static { _classThis = this; }
        constructor() {
            super(...arguments);
            this.blockDraggable = true;
            this.resourceController = new ResourceController(computed(() => this.model.props.sourceId$.value));
            this.containerStyleMap = styleMap({
                position: 'relative',
                width: '100%',
                margin: '18px 0px',
            });
            this.convertTo = () => {
                return this.std
                    .get(AttachmentEmbedProvider)
                    .convertTo(this.model, this._maxFileSize);
            };
            this.copy = () => {
                const slice = Slice.fromModels(this.store, [this.model]);
                this.std.clipboard.copySlice(slice).catch(console.error);
                toast(this.host, 'Copied to clipboard');
            };
            this.download = () => {
                downloadAttachmentBlob(this);
            };
            this.embedded = () => {
                return (Boolean(this.blobUrl) &&
                    this.std
                        .get(AttachmentEmbedProvider)
                        .embedded(this.model, this._maxFileSize));
            };
            this.open = () => {
                const blobUrl = this.blobUrl;
                if (!blobUrl)
                    return;
                window.open(blobUrl, '_blank');
            };
            // Refreshes data.
            this.refreshData = () => {
                refreshData(this).catch(console.error);
            };
            this._refreshKey$ = signal(null);
            // Refreshes the embed component.
            this.reload = () => {
                batch(() => {
                    if (this.model.props.embed$.value) {
                        this._refreshKey$.value = nanoid();
                        return;
                    }
                    this.refreshData();
                });
            };
            // Replaces the current attachment.
            this.replace = async () => {
                const state = this.resourceController.state$.peek();
                if (state.uploading)
                    return;
                const file = await openSingleFileWith();
                if (!file)
                    return;
                const sourceId = await this.std.store.blobSync.set(file);
                const type = await getFileType(file);
                const { name, size } = file;
                let embed = this.model.props.embed$.value ?? false;
                this.std.store.captureSync();
                this.std.store.transact(() => {
                    this.std.store.updateBlock(this.blockId, {
                        name,
                        size,
                        type,
                        sourceId,
                        embed: false,
                    });
                    const provider = this.std.get(AttachmentEmbedProvider);
                    embed &&= provider.embedded(this.model);
                    if (embed) {
                        provider.convertTo(this.model);
                    }
                    // Reloads
                    this.reload();
                });
            };
            this._trackCitationDeleteEvent = () => {
                // Check citation delete event
                this._disposables.add(this.std.store.slots.blockUpdated
                    .pipe(filter(payload => {
                    if (!payload.isLocal)
                        return false;
                    const { flavour, id, type } = payload;
                    if (type !== 'delete' ||
                        flavour !== this.model.flavour ||
                        id !== this.model.id)
                        return false;
                    const { model } = payload;
                    if (!this.citationService.isCitationModel(model))
                        return false;
                    return true;
                }))
                    .subscribe(() => {
                    this.citationService.trackEvent('Delete');
                }));
            };
            this.renderUpgradeButton = () => {
                if (this.std.store.readonly)
                    return null;
                const onOverFileSize = this.std.get(FileSizeLimitProvider).onOverFileSize;
                return when(onOverFileSize, () => html `
        <button
          class="affine-attachment-content-button"
          @click=${(event) => {
                    event.stopPropagation();
                    onOverFileSize?.();
                    {
                        const mode = this.std.get(DocModeProvider).getEditorMode() ?? 'page';
                        const segment = mode === 'page' ? 'doc' : 'whiteboard';
                        this.std
                            .getOptional(TelemetryProvider)
                            ?.track('AttachmentUpgradedEvent', {
                            segment,
                            page: `${segment} editor`,
                            module: 'attachment',
                            control: 'upgrade',
                            category: 'card',
                            type: this.model.props.name.split('.').pop() ?? '',
                        });
                    }
                }}
        >
          ${UpgradeIcon()} Upgrade
        </button>
      `);
            };
            this.renderNormalButton = (needUpload) => {
                const label = needUpload ? 'retry' : 'reload';
                const run = async () => {
                    if (needUpload) {
                        await this.resourceController.upload();
                        return;
                    }
                    this.refreshData();
                };
                return html `
      <button
        class="affine-attachment-content-button"
        @click=${(event) => {
                    event.stopPropagation();
                    run().catch(console.error);
                    {
                        const mode = this.std.get(DocModeProvider).getEditorMode() ?? 'page';
                        const segment = mode === 'page' ? 'doc' : 'whiteboard';
                        this.std
                            .getOptional(TelemetryProvider)
                            ?.track('AttachmentReloadedEvent', {
                            segment,
                            page: `${segment} editor`,
                            module: 'attachment',
                            control: label,
                            category: 'card',
                            type: this.filetype,
                        });
                    }
                }}
      >
        ${ResetIcon()} ${label}
      </button>
    `;
            };
            this.resolvedState$ = computed(() => {
                const size = this.model.props.size;
                const name = this.model.props.name$.value;
                const kind = getAttachmentFileIcon(this.filetype);
                const resolvedState = this.resourceController.resolveStateWith({
                    loadingIcon: LoadingIcon(),
                    errorIcon: WarningIcon(),
                    icon: AttachmentIcon(),
                    title: name,
                    description: formatSize(size),
                });
                return { ...resolvedState, kind };
            });
            this.renderCardView = () => {
                const resolvedState = this.resolvedState$.value;
                const cardStyle = this.model.props.style$.value ?? AttachmentBlockStyles[1];
                const classInfo = {
                    'affine-attachment-card': true,
                    [cardStyle]: true,
                    loading: resolvedState.loading,
                    error: resolvedState.error,
                };
                return when(cardStyle === 'cubeThick', () => this.renderWithVertical(classInfo, resolvedState), () => this.renderWithHorizontal(classInfo, resolvedState));
            };
            this.renderEmbedView = () => {
                const { model, blobUrl } = this;
                if (!model.props.embed$.value || !blobUrl)
                    return null;
                const { std, _maxFileSize } = this;
                const provider = std.get(AttachmentEmbedProvider);
                const render = provider.getRender(model, _maxFileSize);
                if (!render)
                    return null;
                const enabled = provider.shouldShowStatus(model);
                return html `
      <div class="affine-attachment-embed-container">
        ${guard([this._refreshKey$.value], () => render(model, blobUrl))}
      </div>
      ${when(enabled, () => {
                    const resolvedState = this.resolvedState$.value;
                    if (resolvedState.state !== 'error')
                        return null;
                    // It should be an error messge.
                    const message = resolvedState.description;
                    if (!message)
                        return null;
                    const needUpload = resolvedState.needUpload;
                    const action = () => needUpload ? this.resourceController.upload() : this.reload();
                    return html `
          <affine-resource-status
            class="affine-attachment-embed-status"
            .message=${message}
            .needUpload=${needUpload}
            .action=${action}
          ></affine-resource-status>
        `;
                })}
    `;
            };
            this._renderCitation = () => {
                const { name, footnoteIdentifier } = this.model.props;
                const icon = getAttachmentFileIcon(this.filetype);
                return html `<affine-citation-card
      .icon=${icon}
      .citationTitle=${name}
      .citationIdentifier=${footnoteIdentifier}
      .active=${this.selected$.value}
    ></affine-citation-card>`;
            };
            this.#selectedStyle_accessor_storage = SelectedStyle.Border;
            this.#useCaptionEditor_accessor_storage = true;
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AttachmentBlockComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = styles; }
        get blobUrl() {
            return this.resourceController.blobUrl$.value;
        }
        get filetype() {
            const name = this.model.props.name$.value;
            return name.split('.').pop() ?? '';
        }
        get _maxFileSize() {
            return this.std.get(FileSizeLimitProvider).maxFileSize;
        }
        get citationService() {
            return this.std.get(CitationProvider);
        }
        get isCitation() {
            return this.citationService.isCitationModel(this.model);
        }
        get isCommentHighlighted() {
            return (this.std
                .getOptional(BlockElementCommentManager)
                ?.isBlockCommentHighlighted(this.model) ?? false);
        }
        _selectBlock() {
            const selectionManager = this.host.selection;
            const blockSelection = selectionManager.create(BlockSelection, {
                blockId: this.blockId,
            });
            selectionManager.setGroup('note', [blockSelection]);
        }
        connectedCallback() {
            super.connectedCallback();
            this.contentEditable = 'false';
            this.resourceController.setEngine(this.std.store.blobSync);
            this.disposables.add(this.resourceController.subscribe());
            this.disposables.add(this.resourceController);
            this.disposables.add(this.model.props.sourceId$.subscribe(() => {
                this.refreshData();
            }));
            if (!this.model.props.style && !this.store.readonly) {
                this.store.withoutTransact(() => {
                    this.store.updateBlock(this.model, {
                        style: AttachmentBlockStyles[1],
                    });
                });
            }
            this._trackCitationDeleteEvent();
        }
        firstUpdated() {
            // lazy bindings
            this.disposables.addFromEvent(this, 'click', this.onClick);
        }
        onClick(event) {
            // the peek view need handle shift + click
            if (event.defaultPrevented)
                return;
            event.stopPropagation();
            if (!this.selected$.peek()) {
                this._selectBlock();
            }
        }
        renderWithHorizontal(classInfo, { icon, title, description, kind, state, needUpload, }) {
            return html `
      <div class=${classMap(classInfo)}>
        <div class="affine-attachment-content">
          <div class="affine-attachment-content-title">
            <div class="affine-attachment-content-title-icon">${icon}</div>
            <div class="affine-attachment-content-title-text truncate">
              ${title}
            </div>
          </div>

          <div class="affine-attachment-content-description">
            <div class="affine-attachment-content-info truncate">
              ${description}
            </div>
            ${choose(state, [
                ['error', () => this.renderNormalButton(needUpload)],
                ['error:oversize', this.renderUpgradeButton],
            ])}
          </div>
        </div>

        <div class="affine-attachment-banner">${kind}</div>
      </div>
    `;
        }
        renderWithVertical(classInfo, { icon, title, description, kind, state, needUpload, }) {
            return html `
      <div class=${classMap(classInfo)}>
        <div class="affine-attachment-content">
          <div class="affine-attachment-content-title">
            <div class="affine-attachment-content-title-icon">${icon}</div>
            <div class="affine-attachment-content-title-text truncate">
              ${title}
            </div>
          </div>

          <div class="affine-attachment-content-info truncate">
            ${description}
          </div>
        </div>

        <div class="affine-attachment-banner">
          ${kind}
          ${choose(state, [
                ['error', () => this.renderNormalButton(needUpload)],
                ['error:oversize', this.renderUpgradeButton],
            ])}
        </div>
      </div>
    `;
        }
        renderBlock() {
            return html `
      <div
        class=${classMap({
                'affine-attachment-container': true,
                focused: this.selected$.value,
                'comment-highlighted': this.isCommentHighlighted,
            })}
        style=${this.containerStyleMap}
      >
        ${when(this.isCitation, () => this._renderCitation(), () => this.renderEmbedView() ?? this.renderCardView())}
      </div>
    `;
        }
        #selectedStyle_accessor_storage;
        get selectedStyle() { return this.#selectedStyle_accessor_storage; }
        set selectedStyle(value) { this.#selectedStyle_accessor_storage = value; }
        #useCaptionEditor_accessor_storage;
        get useCaptionEditor() { return this.#useCaptionEditor_accessor_storage; }
        set useCaptionEditor(value) { this.#useCaptionEditor_accessor_storage = value; }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return AttachmentBlockComponent = _classThis;
})();
export { AttachmentBlockComponent };
