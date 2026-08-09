import { OpenIcon } from '@blocksuite/affine-components/icons';
import { BlockSelection } from '@blocksuite/std';
import { html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { EmbedBlockComponent } from '../common/embed-block-element.js';
import { FigmaIcon, styles } from './styles.js';
export class EmbedFigmaBlockComponent extends EmbedBlockComponent {
    constructor() {
        super(...arguments);
        this._cardStyle = 'figma';
        this.open = () => {
            let link = this.model.props.url;
            if (!link.match(/^[a-zA-Z]+:\/\//)) {
                link = 'https://' + link;
            }
            window.open(link, '_blank');
        };
        this.refreshData = () => { };
    }
    static { this.styles = styles; }
    _handleDoubleClick(event) {
        event.stopPropagation();
        this.open();
    }
    _selectBlock() {
        const selectionManager = this.host.selection;
        const blockSelection = selectionManager.create(BlockSelection, {
            blockId: this.blockId,
        });
        selectionManager.setGroup('note', [blockSelection]);
    }
    _handleClick(event) {
        event.stopPropagation();
        this._selectBlock();
    }
    connectedCallback() {
        super.connectedCallback();
        this._cardStyle = this.model.props.style;
        if (!this.model.props.title) {
            this.store.withoutTransact(() => {
                this.store.updateBlock(this.model, {
                    title: 'Figma',
                });
            });
        }
        this.disposables.add(this.model.propsUpdated.subscribe(({ key }) => {
            if (key === 'url') {
                this.refreshData();
            }
        }));
    }
    renderBlock() {
        const { title, description, url } = this.model.props;
        const titleText = title ?? 'Figma';
        return this.renderEmbed(() => html `
        <div
          class=${classMap({
            'affine-embed-figma-block': true,
            selected: this.selected$.value,
        })}
          @click=${this._handleClick}
          @dblclick=${this._handleDoubleClick}
        >
          <div class="affine-embed-figma">
            <div class="affine-embed-figma-iframe-container">
              <iframe
                src=${`https://www.figma.com/embed?embed_host=blocksuite&url=${url}`}
                sandbox="allow-same-origin allow-scripts allow-presentation"
                allow="fullscreen"
                loading="lazy"
                credentialless
              ></iframe>

              <!-- overlay to prevent the iframe from capturing pointer events -->
              <div
                class=${classMap({
            'affine-embed-figma-iframe-overlay': true,
            hide: !this.showOverlay$.value,
        })}
              ></div>
            </div>
          </div>
          <div class="affine-embed-figma-content">
            <div class="affine-embed-figma-content-header">
              <div class="affine-embed-figma-content-title-icon">
                ${FigmaIcon}
              </div>

              <div class="affine-embed-figma-content-title-text">
                ${titleText}
              </div>
            </div>

            ${description
            ? html `<div class="affine-embed-figma-content-description">
                  ${description}
                </div>`
            : nothing}

            <div class="affine-embed-figma-content-url" @click=${this.open}>
              <span>www.figma.com</span>

              <div class="affine-embed-figma-content-url-icon">${OpenIcon}</div>
            </div>
          </div>
        </div>
      `);
    }
}
