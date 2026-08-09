import { StoreExtension } from '@blocksuite/store';
import { signal } from '@preact/signals-core';
export class FeatureFlagService extends StoreExtension {
    static { this.key = 'feature-flag-server'; }
    setFlag(key, value) {
        this._flags.value = {
            ...this._flags.value,
            [key]: value,
        };
    }
    getFlag(key) {
        return this._flags.value[key];
    }
    constructor(store) {
        super(store);
        this._flags = signal({
            enable_database_attachment_note: false,
            enable_database_full_width: false,
            enable_block_query: false,
            enable_edgeless_text: true,
            enable_ai_onboarding: true,
            enable_ai_chat_block: true,
            enable_color_picker: true,
            enable_mind_map_import: true,
            enable_advanced_block_visibility: false,
            enable_shape_shadow_blur: false,
            enable_mobile_keyboard_toolbar: false,
            enable_mobile_linked_doc_menu: false,
            enable_block_meta: true,
            enable_mobile_database_editing: false,
            enable_edgeless_scribbled_style: false,
            enable_table_virtual_scroll: false,
            enable_turbo_renderer: false,
            enable_dom_renderer: false,
            enable_pdfmake_export: false,
        });
    }
}
