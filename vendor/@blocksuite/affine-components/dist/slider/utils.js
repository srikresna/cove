export function isDiscreteRange(range) {
    return (typeof range === 'object' &&
        range !== null &&
        'points' in range &&
        Array.isArray(range.points));
}
