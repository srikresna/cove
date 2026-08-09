export class AdaptiveStrideController {
    constructor(_options) {
        this._options = _options;
        this._stride = 1;
        this._ticks = 0;
    }
    reportCost(costMs) {
        if (costMs > this._options.heavyCostMs) {
            this._stride = Math.min(this._options.maxStride, this._stride + 1);
            return;
        }
        if (costMs < this._options.recoveryCostMs && this._stride > 1) {
            this._stride -= 1;
        }
    }
    reset() {
        this._stride = 1;
        this._ticks = 0;
    }
    shouldSkip() {
        const shouldSkip = this._stride > 1 && this._ticks % this._stride !== 0;
        this._ticks += 1;
        return shouldSkip;
    }
}
export class AdaptiveCooldownController {
    constructor(_options) {
        this._options = _options;
        this._remainingFrames = 0;
    }
    reportCost(costMs) {
        if (costMs > this._options.maxCostMs) {
            this._remainingFrames = this._options.cooldownFrames;
        }
    }
    reset() {
        this._remainingFrames = 0;
    }
    shouldRun() {
        if (this._remainingFrames <= 0) {
            return true;
        }
        this._remainingFrames -= 1;
        return false;
    }
}
