let opMeasureSeq = 0;
/**
 * Measure operation cost via Performance API when available.
 *
 * Marks are always cleared, while measure entries are intentionally retained
 * so callers can inspect them from Performance tools.
 */
export const measureOperation = (name, fn) => {
    if (typeof performance === 'undefined' ||
        typeof performance.mark !== 'function' ||
        typeof performance.measure !== 'function') {
        return fn();
    }
    const operationId = opMeasureSeq++;
    const startMark = `${name}:${operationId}:start`;
    const endMark = `${name}:${operationId}:end`;
    performance.mark(startMark);
    try {
        return fn();
    }
    finally {
        performance.mark(endMark);
        performance.measure(name, startMark, endMark);
        performance.clearMarks(startMark);
        performance.clearMarks(endMark);
    }
};
