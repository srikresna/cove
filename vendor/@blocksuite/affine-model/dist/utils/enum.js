export function createEnumMap(EnumObject) {
    return Object.entries(EnumObject).reduce((acc, [key, value]) => {
        acc[value] = key;
        return acc;
    }, {});
}
