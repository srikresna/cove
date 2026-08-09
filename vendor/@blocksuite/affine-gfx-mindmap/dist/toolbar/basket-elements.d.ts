import { type MindmapStyle } from '@blocksuite/affine-model';
import { Bound } from '@blocksuite/global/gfx';
import type { BlockComponent } from '@blocksuite/std';
import type { TemplateResult } from 'lit';
export type ConfigProperty = 'x' | 'y' | 'r' | 's' | 'z' | 'o';
export type ConfigState = 'default' | 'active' | 'hover' | 'next';
export type ConfigStyle = Partial<Record<ConfigProperty, number | string>>;
export type ToolConfig = Record<ConfigState, ConfigStyle>;
export type DraggableTool = {
    name: 'text' | 'mindmap' | 'media';
    icon: TemplateResult;
    config: ToolConfig;
    standardWidth?: number;
    render: (bound: Bound, edgeless: BlockComponent) => Promise<string | null>;
};
export declare const textConfig: ToolConfig;
export declare const mindmapConfig: ToolConfig;
export declare const mediaConfig: ToolConfig;
export declare const getMindmapRender: (mindmapStyle: MindmapStyle) => DraggableTool["render"];
export declare const textRender: DraggableTool['render'];
export declare const mediaRender: DraggableTool['render'];
export declare const toolConfig2StyleObj: (config: ToolConfig) => Record<string, string>;
//# sourceMappingURL=basket-elements.d.ts.map