import './test-block.js';
import { literal } from 'lit/static-html.js';
import { BlockViewExtension } from '../extension/index.js';
export const testSpecs = [
    BlockViewExtension('test:page', literal `test-root-block`),
    BlockViewExtension('test:note', literal `test-note-block`),
    BlockViewExtension('test:heading', model => {
        const h = model.props.type$.value;
        if (h === 'h1') {
            return literal `test-h1-block`;
        }
        return literal `test-h2-block`;
    }),
    BlockViewExtension('test:surface', literal `test-surface-block`),
    BlockViewExtension('test:gfx-block', literal `test-gfx-block`),
];
