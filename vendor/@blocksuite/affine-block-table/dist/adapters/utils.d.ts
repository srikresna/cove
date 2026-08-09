import type { TableBlockPropsSerialized, TableCellSerialized, TableColumn, TableRow } from '@blocksuite/affine-model';
import { type HtmlAST, type MarkdownAST } from '@blocksuite/affine-shared/adapters';
import type { DeltaInsert } from '@blocksuite/store';
import type { Element } from 'hast';
import type { Table as MarkdownTable } from 'mdast';
type RichTextType = DeltaInsert[];
export declare function formatTable(rows: string[][]): string;
type Table = {
    rows: Row[];
};
type Row = {
    cells: Cell[];
};
type Cell = {
    value: {
        delta: DeltaInsert[];
    };
};
export declare const processTable: (columns: Record<string, TableColumn>, rows: Record<string, TableRow>, cells: Record<string, TableCellSerialized>) => Table;
export declare const createTableProps: (deltasLists: RichTextType[][]) => {
    columns: {
        [k: string]: TableColumn;
    };
    rows: {
        [k: string]: TableRow;
    };
    cells: Record<string, TableCellSerialized>;
};
export declare const parseTableFromHtml: (element: Element, astToDelta: (ast: HtmlAST) => RichTextType) => TableBlockPropsSerialized;
export declare const parseTableFromMarkdown: (node: MarkdownTable, astToDelta: (ast: MarkdownAST) => RichTextType) => {
    columns: {
        [k: string]: TableColumn;
    };
    rows: {
        [k: string]: TableRow;
    };
    cells: Record<string, TableCellSerialized>;
};
export {};
//# sourceMappingURL=utils.d.ts.map