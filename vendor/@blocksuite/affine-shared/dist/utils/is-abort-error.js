export function isAbortError(error) {
    return error instanceof Error && error.name === 'AbortError';
}
