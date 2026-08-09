import { ArrowUpSmallIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { css, html } from 'lit';
export class ToolbarArrowUpIcon extends ShadowlessElement {
    static { this.styles = css `
    .arrow-up-icon {
      position: absolute;
      top: -2px;
      right: -2px;
    }
  `; }
    render() {
        return html `<span class="arrow-up-icon"> ${ArrowUpSmallIcon()} </span>`;
    }
}
