import { databaseBlockModels } from '../properties/model';
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
export const isDelta = (value) => {
    if (typeof value === 'object' && value !== null) {
        return '$blocksuite:internal:text$' in value;
    }
    return false;
};
export const processTable = (columns = [], children = [], cells = {}) => {
    const table = {
        headers: columns,
        rows: [],
    };
    children.forEach(v => {
        const row = {
            cells: [],
        };
        const title = v.props.text;
        if (isDelta(title)) {
            row.cells.push({
                value: title,
            });
        }
        else {
            row.cells.push({
                value: '',
            });
        }
        columns.forEach(col => {
            const property = databaseBlockModels[col.type];
            const cell = cells[v.id]?.[col.id];
            if (col.type === 'title') {
                return;
            }
            if (!cell || !property) {
                row.cells.push({
                    value: '',
                });
                return;
            }
            let value;
            try {
                if (isDelta(cell.value)) {
                    value = cell.value;
                }
                else {
                    value = property.config.rawValue.toString({
                        value: cell.value,
                        data: col.data,
                    });
                }
            }
            catch {
                value = '';
            }
            row.cells.push({
                value,
            });
        });
        table.rows.push(row);
    });
    return table;
};
