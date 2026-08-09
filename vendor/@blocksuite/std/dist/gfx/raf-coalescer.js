const getFrameScheduler = () => {
    if (typeof requestAnimationFrame === 'function') {
        return requestAnimationFrame;
    }
    return callback => {
        return globalThis.setTimeout(() => {
            callback(typeof performance !== 'undefined' ? performance.now() : Date.now());
        }, 16);
    };
};
const getFrameCanceller = () => {
    if (typeof cancelAnimationFrame === 'function') {
        return cancelAnimationFrame;
    }
    return id => globalThis.clearTimeout(id);
};
/**
 * Coalesce high-frequency updates and only process the latest payload in one frame.
 */
export const createRafCoalescer = (apply) => {
    const scheduleFrame = getFrameScheduler();
    const cancelFrame = getFrameCanceller();
    let pendingPayload;
    let hasPendingPayload = false;
    let rafId = null;
    const run = () => {
        rafId = null;
        if (!hasPendingPayload)
            return;
        const payload = pendingPayload;
        pendingPayload = undefined;
        hasPendingPayload = false;
        apply(payload);
    };
    return {
        schedule(payload) {
            pendingPayload = payload;
            hasPendingPayload = true;
            if (rafId !== null)
                return;
            rafId = scheduleFrame(run);
        },
        flush() {
            if (rafId !== null)
                cancelFrame(rafId);
            run();
        },
        cancel() {
            if (rafId !== null) {
                cancelFrame(rafId);
                rafId = null;
            }
            pendingPayload = undefined;
            hasPendingPayload = false;
        },
    };
};
