import { buildPalettes, getColorByKey, pureBlack, pureWhite } from './utils';
const Transparent = 'transparent';
const White = getColorByKey('edgeless/palette/white');
const Black = getColorByKey('edgeless/palette/black');
const Light = {
    Red: getColorByKey('edgeless/palette/light/redLight'),
    Orange: getColorByKey('edgeless/palette/light/orangeLight'),
    Yellow: getColorByKey('edgeless/palette/light/yellowLight'),
    Green: getColorByKey('edgeless/palette/light/greenLight'),
    Blue: getColorByKey('edgeless/palette/light/blueLight'),
    Purple: getColorByKey('edgeless/palette/light/purpleLight'),
    Magenta: getColorByKey('edgeless/palette/light/magentaLight'),
    Grey: getColorByKey('edgeless/palette/light/greyLight'),
};
const Medium = {
    Red: getColorByKey('edgeless/palette/medium/redMedium'),
    Orange: getColorByKey('edgeless/palette/medium/orangeMedium'),
    Yellow: getColorByKey('edgeless/palette/medium/yellowMedium'),
    Green: getColorByKey('edgeless/palette/medium/greenMedium'),
    Blue: getColorByKey('edgeless/palette/medium/blueMedium'),
    Purple: getColorByKey('edgeless/palette/medium/purpleMedium'),
    Magenta: getColorByKey('edgeless/palette/medium/magentaMedium'),
    Grey: getColorByKey('edgeless/palette/medium/greyMedium'),
};
const Heavy = {
    Red: getColorByKey('edgeless/palette/heavy/red'),
    Orange: getColorByKey('edgeless/palette/heavy/orange'),
    Yellow: getColorByKey('edgeless/palette/heavy/yellow'),
    Green: getColorByKey('edgeless/palette/heavy/green'),
    Blue: getColorByKey('edgeless/palette/heavy/blue'),
    Purple: getColorByKey('edgeless/palette/heavy/purple'),
    Magenta: getColorByKey('edgeless/palette/heavy/magenta'),
};
const NoteBackgroundColorMap = {
    Red: getColorByKey('edgeless/note/red'),
    Orange: getColorByKey('edgeless/note/orange'),
    Yellow: getColorByKey('edgeless/note/yellow'),
    Green: getColorByKey('edgeless/note/green'),
    Blue: getColorByKey('edgeless/note/blue'),
    Purple: getColorByKey('edgeless/note/purple'),
    Magenta: getColorByKey('edgeless/note/magenta'),
    White: getColorByKey('edgeless/note/white'),
    Transparent: Transparent,
};
const Palettes = [
    // Light
    ...buildPalettes(Light, 'Light'),
    { key: 'Transparent', value: Transparent },
    // Medium
    ...buildPalettes(Medium, 'Medium'),
    { key: 'White', value: White },
    // Heavy
    ...buildPalettes(Heavy, 'Heavy'),
    { key: 'Black', value: Black },
];
const NoteBackgroundColorPalettes = [
    ...buildPalettes(NoteBackgroundColorMap),
];
const StrokeColorShortMap = { ...Medium, Black, White };
const StrokeColorShortPalettes = [
    ...buildPalettes(StrokeColorShortMap),
];
const FillColorShortMap = { ...Medium, Black, White, Transparent };
const FillColorShortPalettes = [
    ...buildPalettes(FillColorShortMap),
];
const ShapeTextColorShortMap = {
    ...Medium,
    Black: pureBlack,
    White: pureWhite,
};
const ShapeTextColorShortPalettes = [
    ...buildPalettes({ ...ShapeTextColorShortMap }),
];
const ShapeTextColorPalettes = [
    // Light
    ...buildPalettes(Light, 'Light'),
    { key: 'Transparent', value: Transparent },
    // Medium
    ...buildPalettes(Medium, 'Medium'),
    { key: 'White', value: pureWhite },
    // Heavy
    ...buildPalettes(Heavy, 'Heavy'),
    { key: 'Black', value: pureBlack },
];
export const DefaultTheme = {
    pureBlack,
    pureWhite,
    black: Black,
    white: White,
    transparent: Transparent,
    textColor: Black,
    shapeTextColor: pureBlack,
    shapeStrokeColor: Medium.Yellow,
    shapeFillColor: Medium.Yellow,
    connectorColor: Medium.Grey,
    noteBackgrounColor: NoteBackgroundColorMap.White,
    // 30% transparent `Medium.Blue`
    hightlighterColor: '#84cfff4d',
    Palettes,
    ShapeTextColorPalettes,
    NoteBackgroundColorMap,
    NoteBackgroundColorPalettes,
    StrokeColorShortMap,
    StrokeColorShortPalettes,
    FillColorShortMap,
    FillColorShortPalettes,
    ShapeTextColorShortMap,
    ShapeTextColorShortPalettes,
};
