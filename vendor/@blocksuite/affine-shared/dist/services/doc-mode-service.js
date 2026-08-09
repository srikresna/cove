import { createIdentifier } from '@blocksuite/global/di';
import { noop } from '@blocksuite/global/utils';
import { Extension } from '@blocksuite/store';
import { Subject } from 'rxjs';
const DEFAULT_MODE = 'page';
export const DocModeProvider = createIdentifier('AffineDocModeService');
const modeMap = new Map();
const slotMap = new Map();
export class DocModeService extends Extension {
    static setup(di) {
        di.addImpl(DocModeProvider, DocModeService);
    }
    getEditorMode() {
        return null;
    }
    getPrimaryMode(id) {
        return modeMap.get(id) ?? DEFAULT_MODE;
    }
    onPrimaryModeChange(handler, id) {
        if (!slotMap.get(id)) {
            slotMap.set(id, new Subject());
        }
        return slotMap.get(id).subscribe(handler);
    }
    setEditorMode(mode) {
        noop(mode);
    }
    setPrimaryMode(mode, id) {
        modeMap.set(id, mode);
        slotMap.get(id)?.next(mode);
    }
    togglePrimaryMode(id) {
        const mode = this.getPrimaryMode(id) === 'page' ? 'edgeless' : 'page';
        this.setPrimaryMode(mode, id);
        return mode;
    }
}
export function DocModeExtension(service) {
    return {
        setup: di => {
            di.override(DocModeProvider, () => service);
        },
    };
}
