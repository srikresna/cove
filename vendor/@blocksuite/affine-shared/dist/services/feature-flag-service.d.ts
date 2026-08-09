import { type Store, StoreExtension } from '@blocksuite/store';
export interface BlockSuiteFlags {
    enable_database_attachment_note: boolean;
    enable_database_full_width: boolean;
    enable_block_query: boolean;
    enable_edgeless_text: boolean;
    enable_ai_onboarding: boolean;
    enable_ai_chat_block: boolean;
    enable_color_picker: boolean;
    enable_mind_map_import: boolean;
    enable_advanced_block_visibility: boolean;
    enable_shape_shadow_blur: boolean;
    enable_mobile_keyboard_toolbar: boolean;
    enable_mobile_linked_doc_menu: boolean;
    enable_mobile_database_editing: boolean;
    enable_block_meta: boolean;
    enable_edgeless_scribbled_style: boolean;
    enable_table_virtual_scroll: boolean;
    enable_turbo_renderer: boolean;
    enable_dom_renderer: boolean;
    enable_pdfmake_export: boolean;
}
export declare class FeatureFlagService extends StoreExtension {
    static key: string;
    private readonly _flags;
    setFlag(key: keyof BlockSuiteFlags, value: boolean): void;
    getFlag(key: keyof BlockSuiteFlags): boolean;
    constructor(store: Store);
}
//# sourceMappingURL=feature-flag-service.d.ts.map