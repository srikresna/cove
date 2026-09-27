import { Transformer, type TransformerMiddleware } from '@blocksuite/store';
declare global {
    interface Window {
        happyDOM: {
            settings: {
                fetch: {
                    disableSameOriginPolicy: boolean;
                };
            };
        };
    }
}
export declare function createJob(middlewares?: TransformerMiddleware[]): Transformer;
//# sourceMappingURL=create-job.d.ts.map