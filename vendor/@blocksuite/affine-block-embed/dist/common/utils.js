import { EmbedCardDarkBannerIcon, EmbedCardDarkCubeIcon, EmbedCardDarkHorizontalIcon, EmbedCardDarkListIcon, EmbedCardDarkVerticalIcon, EmbedCardLightBannerIcon, EmbedCardLightCubeIcon, EmbedCardLightHorizontalIcon, EmbedCardLightListIcon, EmbedCardLightVerticalIcon, } from '@blocksuite/affine-components/icons';
import { ColorScheme } from '@blocksuite/affine-model';
import { EmbedOptionProvider } from '@blocksuite/affine-shared/services';
export function getEmbedCardIcons(theme) {
    if (theme === ColorScheme.Light) {
        return {
            EmbedCardBannerIcon: EmbedCardLightBannerIcon,
            EmbedCardHorizontalIcon: EmbedCardLightHorizontalIcon,
            EmbedCardListIcon: EmbedCardLightListIcon,
            EmbedCardVerticalIcon: EmbedCardLightVerticalIcon,
            EmbedCardCubeIcon: EmbedCardLightCubeIcon,
        };
    }
    else {
        return {
            EmbedCardBannerIcon: EmbedCardDarkBannerIcon,
            EmbedCardHorizontalIcon: EmbedCardDarkHorizontalIcon,
            EmbedCardListIcon: EmbedCardDarkListIcon,
            EmbedCardVerticalIcon: EmbedCardDarkVerticalIcon,
            EmbedCardCubeIcon: EmbedCardDarkCubeIcon,
        };
    }
}
export function canEmbedAsEmbedBlock(std, url) {
    const options = std.get(EmbedOptionProvider).getEmbedBlockOptions(url);
    return options?.viewType === 'embed';
}
