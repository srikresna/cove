import {} from '@blocksuite/affine-shared/adapters';
import { HastUtils } from '@blocksuite/affine-shared/adapters';
import { generateFractionalIndexingKeyBetween } from '@blocksuite/affine-shared/utils';
import { nanoid } from '@blocksuite/store';
import { compareByOrder } from '../utils';
const createRichText = (text) => {
    return {
        '$blocksuite:internal:text$': true,
        delta: text,
    };
};
function calculateColumnWidths(rows) {
    return (rows[0]?.map((_, colIndex) => Math.max(...rows.map(row => (row[colIndex] || '').length))) ?? []);
}
function formatRow(row, columnWidths, isHeader) {
    const cells = row.map((cell, colIndex) => cell?.padEnd(columnWidths[colIndex] ?? 0, ' '));
    const rowString = `| ${cells.join(' | ')} |`;
    return isHeader
        ? `${rowString}\n${formatSeparator(columnWidths)}`
        : rowString;
}
function formatSeparator(columnWidths) {
    const separator = columnWidths.map(width => '-'.repeat(width)).join(' | ');
    return `| ${separator} |`;
}
export function formatTable(rows) {
    const columnWidths = calculateColumnWidths(rows);
    const formattedRows = rows.map((row, index) => formatRow(row, columnWidths, index === 0));
    return formattedRows.join('\n');
}
export const processTable = (columns, rows, cells) => {
    const sortedColumns = Object.values(columns).sort(compareByOrder);
    const sortedRows = Object.values(rows).sort(compareByOrder);
    const table = {
        rows: [],
    };
    sortedRows.forEach(r => {
        const row = {
            cells: [],
        };
        sortedColumns.forEach(col => {
            const cell = cells[`${r.rowId}:${col.columnId}`];
            if (!cell) {
                row.cells.push({
                    value: {
                        delta: [],
                    },
                });
                return;
            }
            row.cells.push({
                value: cell.text,
            });
        });
        table.rows.push(row);
    });
    return table;
};
const getAllTag = (node, tagName) => {
    if (!node) {
        return [];
    }
    if (HastUtils.isElement(node)) {
        if (node.tagName === tagName) {
            return [node];
        }
        return node.children.flatMap(child => {
            if (HastUtils.isElement(child)) {
                return getAllTag(child, tagName);
            }
            return [];
        });
    }
    return [];
};
export const createTableProps = (deltasLists) => {
    const createIdAndOrder = (count) => {
        const result = Array.from({
            length: count,
        });
        for (let i = 0; i < count; i++) {
            const id = nanoid();
            const order = generateFractionalIndexingKeyBetween(result[i - 1]?.order ?? null, null);
            result[i] = { id, order };
        }
        return result;
    };
    const columnCount = Math.max(...deltasLists.map(row => row.length));
    const rowCount = deltasLists.length;
    const columns = createIdAndOrder(columnCount).map(v => ({
        columnId: v.id,
        order: v.order,
    }));
    const rows = createIdAndOrder(rowCount).map(v => ({
        rowId: v.id,
        order: v.order,
    }));
    const cells = {};
    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < columnCount; j++) {
            const row = rows[i];
            const column = columns[j];
            if (!row || !column) {
                continue;
            }
            const cellId = `${row.rowId}:${column.columnId}`;
            const text = deltasLists[i]?.[j];
            cells[cellId] = {
                text: createRichText(text ?? []),
            };
        }
    }
    return {
        columns: Object.fromEntries(columns.map(column => [column.columnId, column])),
        rows: Object.fromEntries(rows.map(row => [row.rowId, row])),
        cells,
    };
};
export const parseTableFromHtml = (element, astToDelta) => {
    const headerRows = getAllTag(element, 'thead').flatMap(node => getAllTag(node, 'tr').map(tr => getAllTag(tr, 'th')));
    const bodyRows = getAllTag(element, 'tbody').flatMap(node => getAllTag(node, 'tr').map(tr => getAllTag(tr, 'td')));
    const footerRows = getAllTag(element, 'tfoot').flatMap(node => getAllTag(node, 'tr').map(tr => getAllTag(tr, 'td')));
    const allRows = [...headerRows, ...bodyRows, ...footerRows];
    const rowTextLists = [];
    allRows.forEach(cells => {
        const row = [];
        cells.forEach(cell => {
            row.push(astToDelta(cell));
        });
        rowTextLists.push(row);
    });
    return createTableProps(rowTextLists);
};
export const parseTableFromMarkdown = (node, astToDelta) => {
    const rowTextLists = [];
    node.children.forEach(row => {
        const rowText = [];
        row.children.forEach(cell => {
            rowText.push(astToDelta(cell));
        });
        rowTextLists.push(rowText);
    });
    return createTableProps(rowTextLists);
};
