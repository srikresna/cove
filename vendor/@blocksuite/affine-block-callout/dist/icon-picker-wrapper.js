import { ShadowlessElement } from '@blocksuite/std';
import {} from '@preact/signals-core';
import { html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
// Copy of renderUniLit from callout-block.ts
const renderUniLit = (uni, props, options) => {
    return html ` <uni-lit
    .uni="${uni}"
    .props="${props}"
    .ref="${options?.ref}"
    style=${options?.style ? styleMap(options?.style) : ''}
  ></uni-lit>`;
};
export class IconPickerWrapper extends ShadowlessElement {
    constructor() {
        super();
    }
    render() {
        if (!this.iconPickerComponent) {
            return html ``;
        }
        return renderUniLit(this.iconPickerComponent, this.props);
    }
}
