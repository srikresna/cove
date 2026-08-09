import { createIdentifier, } from '@blocksuite/global/di';
import { baseTextAttributes, } from '@blocksuite/store';
import { z } from 'zod';
import { StdIdentifier } from '../../identifier.js';
import { getDefaultAttributeRenderer } from '../utils/attribute-renderer.js';
import { MarkdownMatcherIdentifier } from './markdown-matcher.js';
export class InlineManager {
    get markdownMatches() {
        if (!this.enableMarkdown) {
            return [];
        }
        const matches = Array.from(this.std.provider.getAll(MarkdownMatcherIdentifier).values());
        return matches;
    }
    constructor(std, enableMarkdown, ...specs) {
        this.std = std;
        this.enableMarkdown = enableMarkdown;
        this.embedChecker = (delta) => {
            for (const spec of this.specs) {
                if (spec.embed && spec.match(delta)) {
                    return true;
                }
            }
            return false;
        };
        this.getRenderer = () => {
            const defaultRenderer = getDefaultAttributeRenderer();
            const renderer = props => {
                // Priority increases from front to back
                const specs = this.specs.toReversed();
                const wrapperSpecs = specs.filter(spec => spec.wrapper);
                const normalSpecs = specs.filter(spec => !spec.wrapper);
                let result = defaultRenderer(props);
                for (const spec of normalSpecs) {
                    if (spec.match(props.delta)) {
                        result = spec.renderer(props);
                        break;
                    }
                }
                for (const spec of wrapperSpecs) {
                    if (spec.match(props.delta)) {
                        result = spec.renderer({
                            ...props,
                            children: result,
                        });
                    }
                }
                return result;
            };
            return renderer;
        };
        this.getSchema = () => {
            const schema = this.specs.reduce((acc, cur) => {
                return z.intersection(acc, cur.schema);
            }, baseTextAttributes);
            return schema;
        };
        this.specs = specs;
    }
}
const InlineManagerIdentifier = createIdentifier('AffineInlineManager');
export function InlineManagerExtension({ id, enableMarkdown = true, specs, }) {
    const identifier = InlineManagerIdentifier(id);
    return {
        setup: di => {
            di.addImpl(identifier, provider => {
                return new InlineManager(provider.get(StdIdentifier), enableMarkdown, ...specs.map(spec => provider.get(spec)));
            });
        },
        identifier,
    };
}
