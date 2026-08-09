export function almostEqual(a, b, epsilon = 0.0001) {
    return Math.abs(a - b) < epsilon;
}
export function rangeWrap(n, min, max) {
    max = max - min;
    n = (n - min + max) % max;
    return min + (Number.isNaN(n) ? 0 : n);
}
