import { BlockViewExtension, FlavourExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';
export const DataViewBlockSpec = [
    FlavourExtension('affine:data-view'),
    BlockViewExtension('affine:data-view', literal `affine-data-view`),
];
