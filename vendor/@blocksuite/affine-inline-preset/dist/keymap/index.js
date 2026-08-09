import { textCommonKeymap } from './basic.js';
import { bracketKeymap } from './bracket.js';
import { textFormatKeymap } from './format.js';
export const textKeymap = (std) => {
    return {
        ...textCommonKeymap(std),
        ...bracketKeymap(std),
        ...textFormatKeymap(std),
    };
};
