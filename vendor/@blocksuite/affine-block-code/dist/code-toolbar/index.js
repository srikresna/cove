import { HoverController } from '@blocksuite/affine-components/hover';
import { cloneGroups, getMoreMenuConfig, } from '@blocksuite/affine-components/toolbar';
import { BlockSelection, TextSelection, WidgetComponent, } from '@blocksuite/std';
import { limitShift, shift, size } from '@floating-ui/dom';
import { html } from 'lit';
import { MORE_GROUPS, PRIMARY_GROUPS } from './config.js';
import { CodeBlockToolbarContext } from './context.js';
export const AFFINE_CODE_TOOLBAR_WIDGET = 'affine-code-toolbar-widget';
export class AffineCodeToolbarWidget extends WidgetComponent {
    constructor() {
        super(...arguments);
        this._hoverController = null;
        this._isActivated = false;
        this._setHoverController = () => {
            this._hoverController = null;
            this._hoverController = new HoverController(this, ({ abortController }) => {
                const codeBlock = this.block;
                if (!codeBlock) {
                    return null;
                }
                const selection = this.host.selection;
                const textSelection = selection.find(TextSelection);
                if (!!textSelection &&
                    (!!textSelection.to || !!textSelection.from.length)) {
                    return null;
                }
                const blockSelections = selection.filter(BlockSelection);
                if (blockSelections.length > 1 ||
                    (blockSelections.length === 1 &&
                        blockSelections[0].blockId !== codeBlock.blockId)) {
                    return null;
                }
                const setActive = (active) => {
                    this._isActivated = active;
                    if (!active && !this._hoverController?.isHovering) {
                        this._hoverController?.abort();
                    }
                };
                const context = new CodeBlockToolbarContext(codeBlock, abortController, setActive);
                return {
                    template: html `<affine-code-toolbar
            .context=${context}
            .primaryGroups=${this.primaryGroups}
            .moreGroups=${this.moreGroups}
            .onActiveStatusChange=${setActive}
          ></affine-code-toolbar>`,
                    container: this.block,
                    // stacking-context(editor-host)
                    portalStyles: {
                        zIndex: 'var(--affine-z-index-popover)',
                    },
                    computePosition: {
                        referenceElement: codeBlock,
                        placement: 'top',
                        middleware: [
                            size({
                                apply({ rects, elements }) {
                                    elements.floating.style.width = `${rects.reference.width}px`;
                                },
                            }),
                            shift({
                                crossAxis: true,
                                padding: {
                                    bottom: 12,
                                    right: 12,
                                },
                                limiter: limitShift(),
                            }),
                        ],
                        autoUpdate: true,
                    },
                };
            }, { allowMultiple: true });
            const codeBlock = this.block;
            if (!codeBlock) {
                return;
            }
            this._hoverController.setReference(codeBlock);
            this._hoverController.onAbort = () => {
                // If the more menu is opened, don't close it.
                if (this._isActivated)
                    return;
                this._hoverController?.abort();
                return;
            };
        };
        this.addMoretems = (items, index, type) => {
            let group;
            if (type) {
                group = this.moreGroups.find(g => g.type === type);
            }
            if (!group) {
                group = this.moreGroups[0];
            }
            if (index === undefined) {
                group.items.push(...items);
                return this;
            }
            group.items.splice(index, 0, ...items);
            return this;
        };
        this.addPrimaryItems = (items, index) => {
            if (index === undefined) {
                this.primaryGroups[0].items.push(...items);
                return this;
            }
            this.primaryGroups[0].items.splice(index, 0, ...items);
            return this;
        };
        /*
         * Caches the more menu items.
         * Currently only supports configuring more menu.
         */
        this.moreGroups = cloneGroups(MORE_GROUPS);
        this.primaryGroups = cloneGroups(PRIMARY_GROUPS);
    }
    firstUpdated() {
        this.moreGroups = getMoreMenuConfig(this.std).configure(this.moreGroups);
        this._setHoverController();
    }
}
