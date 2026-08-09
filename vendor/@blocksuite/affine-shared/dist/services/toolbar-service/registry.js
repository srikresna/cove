import { createIdentifier } from '@blocksuite/global/di';
import { StdIdentifier } from '@blocksuite/std';
import { Extension } from '@blocksuite/store';
import { signal } from '@preact/signals-core';
import { Flags } from './flags';
export const ToolbarModuleIdentifier = createIdentifier('AffineToolbarModuleIdentifier');
export const ToolbarRegistryIdentifier = createIdentifier('AffineToolbarRegistryIdentifier');
export function ToolbarModuleExtension(module) {
    return {
        setup: di => {
            di.addImpl(ToolbarModuleIdentifier(module.id.variant), module);
        },
    };
}
export class ToolbarRegistryExtension extends Extension {
    constructor(std) {
        super();
        this.std = std;
        this.flavour$ = signal('affine:note');
        this.elementsMap$ = signal(new Map());
        this.message$ = signal(null);
        this.placement$ = signal('top');
        this.flags = new Flags();
    }
    get modules() {
        return this.std.provider.getAll(ToolbarModuleIdentifier);
    }
    getModuleBy(flavour) {
        return this.modules.get(flavour)?.config ?? null;
    }
    getModulePlacement(flavour, fallback = 'top') {
        return (this.getModuleBy(`custom:${flavour}`)?.placement ??
            this.getModuleBy(flavour)?.placement ??
            fallback);
    }
    static setup(di) {
        di.addImpl(ToolbarRegistryIdentifier, this, [StdIdentifier]);
    }
}
