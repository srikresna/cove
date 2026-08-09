import { BulletedListIcon, CheckBoxCheckLinearIcon, Heading1Icon, Heading2Icon, Heading3Icon, Heading4Icon, Heading5Icon, Heading6Icon, NumberedListIcon, QuoteIcon, TextIcon, } from '@blocksuite/icons/lit';
const icons = {
    text: TextIcon(),
    quote: QuoteIcon(),
    h1: Heading1Icon(),
    h2: Heading2Icon(),
    h3: Heading3Icon(),
    h4: Heading4Icon(),
    h5: Heading5Icon(),
    h6: Heading6Icon(),
    bulleted: BulletedListIcon(),
    numbered: NumberedListIcon(),
    todo: CheckBoxCheckLinearIcon(),
};
export const getIcon = (model) => {
    if (model.flavour === 'affine:paragraph') {
        const type = model.props.type;
        return icons[type] ?? TextIcon();
    }
    if (model.flavour === 'affine:list') {
        return icons[model.props.type ?? 'bulleted'] ?? BulletedListIcon();
    }
    return TextIcon();
};
