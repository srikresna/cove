import { createIdentifier } from '@blocksuite/global/di';
import { BlockSuiteError } from '@blocksuite/global/exceptions';
import { StdIdentifier } from '@blocksuite/std';
export const ViewportElementProvider = createIdentifier('ViewportElementProvider');
export const ViewportElementExtension = (selector) => {
    return {
        setup: di => {
            di.override(ViewportElementProvider, provider => {
                const getViewportElement = () => {
                    const std = provider.get(StdIdentifier);
                    const viewportElement = std.host.closest(selector);
                    if (!viewportElement) {
                        throw new BlockSuiteError(BlockSuiteError.ErrorCode.ValueNotExists, `ViewportElementProvider: viewport element is not found`);
                    }
                    return viewportElement;
                };
                return {
                    get viewportElement() {
                        return getViewportElement();
                    },
                    get viewport() {
                        const viewportElement = getViewportElement();
                        const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight, } = viewportElement;
                        const { top, left } = viewportElement.getBoundingClientRect();
                        return {
                            top,
                            left,
                            scrollLeft,
                            scrollTop,
                            scrollWidth,
                            scrollHeight,
                            clientWidth,
                            clientHeight,
                        };
                    },
                };
            });
        },
    };
};
