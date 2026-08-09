export function wait(time = 0) {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            setTimeout(resolve, time);
        });
    });
}
/**
 * simulate click event
 * @param target
 * @param position position relative to the target
 */
export function click(target, position) {
    const element = target.getBoundingClientRect();
    const clientX = element.x + position.x;
    const clientY = element.y + position.y;
    target.dispatchEvent(new PointerEvent('pointerdown', {
        clientX,
        clientY,
        bubbles: true,
        pointerId: 1,
        isPrimary: true,
    }));
    target.dispatchEvent(new PointerEvent('pointerup', {
        clientX,
        clientY,
        bubbles: true,
        pointerId: 1,
        isPrimary: true,
    }));
    target.dispatchEvent(new MouseEvent('click', {
        clientX,
        clientY,
        bubbles: true,
    }));
}
const defaultPointerOptions = {
    isPrimary: true,
    pointerId: 1,
    pointerType: 'mouse',
};
/**
 * simulate pointerdown event
 * @param target
 * @param position position relative to the target
 */
export function pointerdown(target, position, options = defaultPointerOptions) {
    const element = target.getBoundingClientRect();
    const clientX = element.x + position.x;
    const clientY = element.y + position.y;
    target.dispatchEvent(new PointerEvent('pointerdown', {
        clientX,
        clientY,
        bubbles: true,
        ...options,
    }));
}
/**
 * simulate pointerup event
 * @param target
 * @param position position relative to the target
 */
export function pointerup(target, position, options = defaultPointerOptions) {
    const element = target.getBoundingClientRect();
    const clientX = element.x + position.x;
    const clientY = element.y + position.y;
    target.dispatchEvent(new PointerEvent('pointerup', {
        clientX,
        clientY,
        bubbles: true,
        ...options,
    }));
}
/**
 * simulate pointermove event
 * @param target
 * @param position position relative to the target
 */
export function pointermove(target, position, options = defaultPointerOptions) {
    const element = target.getBoundingClientRect();
    const clientX = element.x + position.x;
    const clientY = element.y + position.y;
    target.dispatchEvent(new PointerEvent('pointermove', {
        clientX,
        clientY,
        bubbles: true,
        ...options,
    }));
}
export function drag(target, start, end, step = 5) {
    pointerdown(target, start);
    pointermove(target, start);
    if (step !== 0) {
        const xStep = (end.x - start.x) / step;
        const yStep = (end.y - start.y) / step;
        for (const [i] of Array.from({ length: step }).entries()) {
            pointermove(target, {
                x: start.x + xStep * (i + 1),
                y: start.y + yStep * (i + 1),
            });
        }
    }
    pointermove(target, end);
    pointerup(target, end);
}
export function multiTouchDown(target, points) {
    points.forEach((point, index) => {
        pointerdown(target, point, {
            isPrimary: index === 0,
            pointerId: index,
            pointerType: 'touch',
        });
    });
}
export function multiTouchMove(target, from, to, step = 5) {
    if (from.length !== to.length) {
        throw new Error('from and to should have the same length');
    }
    if (step !== 0) {
        for (const [i] of Array.from({ length: step }).entries()) {
            const stepPoints = from.map((point, index) => ({
                x: point.x + ((to[index].x - point.x) / step) * (i + 1),
                y: point.y + ((to[index].y - point.y) / step) * (i + 1),
            }));
            from.forEach((_, index) => {
                pointermove(target, stepPoints[index], {
                    isPrimary: index === 0,
                    pointerId: index,
                    pointerType: 'touch',
                });
            });
        }
    }
}
export function multiTouchUp(target, points) {
    points.forEach((point, index) => {
        pointerup(target, point, {
            isPrimary: index === 0,
            pointerId: index,
            pointerType: 'touch',
        });
    });
}
