import { createIdentifier } from '@blocksuite/global/di';
import { disposeMember, } from '@blocksuite/global/disposable';
import { AliasIcon, BlockLinkIcon, DeleteIcon, EdgelessIcon, LinkedEdgelessIcon, LinkedPageIcon, PageIcon, } from '@blocksuite/icons/lit';
import { LifeCycleWatcher, StdIdentifier } from '@blocksuite/std';
import { computed, signal, } from '@preact/signals-core';
import { referenceToNode } from '../utils/reference.js';
import { DocModeProvider } from './doc-mode-service.js';
export const DocDisplayMetaProvider = createIdentifier('DocDisplayMetaService');
export class DocDisplayMetaService extends LifeCycleWatcher {
    constructor() {
        super(...arguments);
        this.disposables = [];
        this.iconMap = new WeakMap();
        this.titleMap = new WeakMap();
    }
    static { this.icons = {
        deleted: iconBuilder(DeleteIcon),
        aliased: iconBuilder(AliasIcon),
        page: iconBuilder(PageIcon),
        edgeless: iconBuilder(EdgelessIcon),
        linkedBlock: iconBuilder(BlockLinkIcon),
        linkedPage: iconBuilder(LinkedPageIcon),
        linkedEdgeless: iconBuilder(LinkedEdgelessIcon),
    }; }
    static { this.key = 'doc-display-meta'; }
    static setup(di) {
        di.addImpl(DocDisplayMetaProvider, this, [StdIdentifier]);
    }
    dispose() {
        while (this.disposables.length > 0) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposeMember(disposable);
            }
        }
    }
    icon(pageId, { params, title, referenced } = {}) {
        const doc = this.std.workspace.getDoc(pageId);
        if (!doc) {
            return computed(() => DocDisplayMetaService.icons.deleted);
        }
        const store = doc.getStore();
        let icon$ = this.iconMap.get(store);
        if (!icon$) {
            icon$ = signal(this.std.get(DocModeProvider).getPrimaryMode(pageId) === 'edgeless'
                ? DocDisplayMetaService.icons.edgeless
                : DocDisplayMetaService.icons.page);
            const disposable = this.std
                .get(DocModeProvider)
                .onPrimaryModeChange(mode => {
                icon$.value =
                    mode === 'edgeless'
                        ? DocDisplayMetaService.icons.edgeless
                        : DocDisplayMetaService.icons.page;
            }, pageId);
            this.disposables.push(disposable);
            this.iconMap.set(store, icon$);
        }
        return computed(() => {
            if (title) {
                return DocDisplayMetaService.icons.aliased;
            }
            if (referenceToNode({ pageId, params })) {
                return DocDisplayMetaService.icons.linkedBlock;
            }
            if (referenced) {
                const mode = params?.mode ??
                    this.std.get(DocModeProvider).getPrimaryMode(pageId) ??
                    'page';
                return mode === 'edgeless'
                    ? DocDisplayMetaService.icons.linkedEdgeless
                    : DocDisplayMetaService.icons.linkedPage;
            }
            return icon$.value;
        });
    }
    title(pageId, { title } = {}) {
        const doc = this.std.workspace.getDoc(pageId);
        if (!doc) {
            return computed(() => title || 'Deleted doc');
        }
        const store = doc.getStore();
        let title$ = this.titleMap.get(store);
        if (!title$) {
            title$ = signal(doc.meta?.title || 'Untitled');
            const disposable = this.std.workspace.slots.docListUpdated.subscribe(() => {
                title$.value = doc.meta?.title || 'Untitled';
            });
            this.disposables.push(disposable);
            this.titleMap.set(store, title$);
        }
        return computed(() => {
            return title || title$.value;
        });
    }
    unmounted() {
        this.dispose();
    }
}
function iconBuilder(icon, size = '1.25em', style = 'user-select:none;flex-shrink:0;vertical-align:middle;font-size:inherit;') {
    return icon({ width: size, height: size, style });
}
