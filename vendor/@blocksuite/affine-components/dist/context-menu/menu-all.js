import { menuButtonItems } from './button';
import { menuDynamicItems } from './dynamic';
import { menuGroupItems } from './group';
import { menuInputItems } from './input';
import { subMenuItems } from './sub-menu';
export const menu = {
    ...menuButtonItems,
    ...subMenuItems,
    ...menuInputItems,
    ...menuGroupItems,
    ...menuDynamicItems,
};
