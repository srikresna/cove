export declare class AdaptiveStrideController {
    private readonly _options;
    private _stride;
    private _ticks;
    constructor(_options: {
        heavyCostMs: number;
        maxStride: number;
        recoveryCostMs: number;
    });
    reportCost(costMs: number): void;
    reset(): void;
    shouldSkip(): boolean;
}
export declare class AdaptiveCooldownController {
    private readonly _options;
    private _remainingFrames;
    constructor(_options: {
        cooldownFrames: number;
        maxCostMs: number;
    });
    reportCost(costMs: number): void;
    reset(): void;
    shouldRun(): boolean;
}
//# sourceMappingURL=adaptive-load-controller.d.ts.map