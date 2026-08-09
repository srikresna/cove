export function createTraitKey(name) {
    return {
        key: Symbol(name),
    };
}
