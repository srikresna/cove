import type { TestWorkspace } from '../test';
declare global {
    interface WindowEventMap {
        'test-result': CustomEvent<TestResult>;
    }
    interface Window {
        collection: TestWorkspace;
    }
}
export interface TestResult {
    success: boolean;
    messages: string[];
}
export declare function testSerial(name: string, callback: () => Promise<boolean>): void;
export declare function runOnce(): Promise<void>;
export declare function nextFrame(): Promise<unknown>;
export declare function loadTestImageBlob(name: string): Promise<Blob>;
export declare function loadImage(blobUrl: string): Promise<HTMLImageElement>;
export declare function assertColor(img: HTMLImageElement, x: number, y: number, color: [number, number, number]): boolean;
export declare function disableButtonsAfterClick(): void;
//# sourceMappingURL=test-utils-dom.d.ts.map