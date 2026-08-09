import { EdgelessToolbarToolMixin, } from './tool.mixin.js';
/**
 * Mixin for quick tool item.
 */
export const QuickToolMixin = (SuperClass) => {
    class DerivedClass extends EdgelessToolbarToolMixin(SuperClass) {
    }
    return DerivedClass;
};
