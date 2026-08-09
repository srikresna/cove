import { computed } from '@preact/signals-core';
export const computedLock = (value$, lock$) => {
    let previousValue;
    return computed(() => {
        if (lock$.value) {
            return previousValue ?? value$.value;
        }
        previousValue = value$.value;
        return previousValue;
    });
};
