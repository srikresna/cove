export const domToOffsets = (element, rowSelector, cellSelector) => {
    const rowDoms = Array.from(element.querySelectorAll(rowSelector));
    const firstRowDom = rowDoms[0];
    if (!firstRowDom)
        return;
    const columnDoms = Array.from(firstRowDom.querySelectorAll(cellSelector));
    const rows = [];
    const columns = [];
    for (let i = 0; i < rowDoms.length; i++) {
        const rect = rowDoms[i].getBoundingClientRect();
        if (!rect)
            continue;
        if (i === 0) {
            rows.push(rect.top);
        }
        rows.push(rect.bottom);
    }
    for (let i = 0; i < columnDoms.length; i++) {
        const rect = columnDoms[i].getBoundingClientRect();
        if (!rect)
            continue;
        if (i === 0) {
            columns.push(rect.left);
        }
        columns.push(rect.right);
    }
    return {
        rows,
        columns,
    };
};
export const getIndexByPosition = (positions, offset, reverse = false) => {
    if (reverse) {
        return positions.slice(1).findIndex(p => offset <= p);
    }
    return positions.slice(0, -1).findLastIndex(p => offset >= p);
};
export const getRangeByPositions = (positions, start, end) => {
    const startIndex = getIndexByPosition(positions, start, true);
    const endIndex = getIndexByPosition(positions, end);
    return {
        start: startIndex,
        end: endIndex,
    };
};
export const getAreaByOffsets = (offsets, top, bottom, left, right) => {
    const { rows, columns } = offsets;
    const startRow = getIndexByPosition(rows, top, true);
    const endRow = getIndexByPosition(rows, bottom);
    const startColumn = getIndexByPosition(columns, left, true);
    const endColumn = getIndexByPosition(columns, right);
    return {
        top: startRow,
        bottom: endRow,
        left: startColumn,
        right: endColumn,
    };
};
