import { DatabaseBlockSchema, } from '@blocksuite/affine-model';
import { BlockMarkdownAdapterExtension, } from '@blocksuite/affine-shared/adapters';
import { processTable } from './utils';
const DATABASE_NODE_TYPES = new Set(['table', 'tableRow']);
const isDatabaseNode = (node) => DATABASE_NODE_TYPES.has(node.type);
export const databaseBlockMarkdownAdapterMatcher = {
    flavour: DatabaseBlockSchema.model.flavour,
    toMatch: o => isDatabaseNode(o.node),
    fromMatch: o => o.node.flavour === DatabaseBlockSchema.model.flavour,
    toBlockSnapshot: {},
    fromBlockSnapshot: {
        enter: (o, context) => {
            const { walkerContext, deltaConverter } = context;
            const rows = [];
            const columns = o.node.props.columns;
            const children = o.node.children;
            const cells = o.node.props.cells;
            const table = processTable(columns, children, cells);
            rows.push({
                type: 'tableRow',
                children: table.headers.map(v => ({
                    type: 'tableCell',
                    children: [{ type: 'text', value: v.name }],
                })),
            });
            table.rows.forEach(v => {
                rows.push({
                    type: 'tableRow',
                    children: v.cells.map(v => ({
                        type: 'tableCell',
                        children: typeof v.value === 'string'
                            ? [{ type: 'text', value: v.value }]
                            : deltaConverter.deltaToAST(v.value.delta),
                    })),
                });
            });
            walkerContext
                .openNode({
                type: 'table',
                children: rows,
            })
                .closeNode();
            walkerContext.skipAllChildren();
        },
    },
};
export const DatabaseBlockMarkdownAdapterExtension = BlockMarkdownAdapterExtension(databaseBlockMarkdownAdapterMatcher);
