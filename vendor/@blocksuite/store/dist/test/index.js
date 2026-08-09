export * from './test-doc.js';
export * from './test-meta.js';
export * from './test-workspace.js';
export function createAutoIncrementIdGenerator() {
    let i = 0;
    return () => (i++).toString();
}
