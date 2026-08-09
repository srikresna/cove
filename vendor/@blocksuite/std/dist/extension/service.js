import { DisposableGroup } from '@blocksuite/global/disposable';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { Extension } from '@blocksuite/store';
import { BlockFlavourIdentifier, BlockServiceIdentifier, StdIdentifier, } from '../identifier.js';
/**
 * @deprecated
 * BlockService is deprecated. You should reconsider where to put your feature.
 *
 * BlockService is a legacy extension that is used to provide services to the block.
 * In the previous version of BlockSuite, block service provides a way to extend the block.
 * However, in the new version, we recommend using the new extension system.
 */
export class BlockService extends Extension {
    get collection() {
        return this.std.workspace;
    }
    get doc() {
        return this.std.store;
    }
    get host() {
        return this.std.host;
    }
    get selectionManager() {
        return this.std.selection;
    }
    get uiEventDispatcher() {
        return this.std.event;
    }
    constructor(std, flavourProvider) {
        super();
        this.std = std;
        this.flavourProvider = flavourProvider;
        this.disposables = new DisposableGroup();
        this.flavour = flavourProvider.flavour;
    }
    static setup(di) {
        if (!this.flavour) {
            throw new BlockSuiteError(ErrorCode.ValueNotExists, 'Flavour is not defined in the BlockService');
        }
        di.add(this, [StdIdentifier, BlockFlavourIdentifier(this.flavour)]);
        di.addImpl(BlockServiceIdentifier(this.flavour), provider => provider.get(this));
    }
    bindHotKey(keymap, options) {
        this.disposables.add(this.uiEventDispatcher.bindHotkey(keymap, {
            flavour: options?.global ? undefined : this.flavour,
        }));
    }
    // life cycle start
    dispose() {
        this.disposables.dispose();
    }
    // event handlers start
    handleEvent(name, fn, options) {
        this.disposables.add(this.uiEventDispatcher.add(name, fn, {
            flavour: options?.global ? undefined : this.flavour,
        }));
    }
    // life cycle end
    mounted() { }
    unmounted() {
        this.disposables.dispose();
    }
}
