import type { ToolbarContext } from '@blocksuite/affine-shared/services';
export declare const moreActions: [{
    readonly id: "Z.a.selection";
    readonly actions: [{
        readonly id: "a.create-frame";
        readonly label: "Frame section";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly run: (ctx: ToolbarContext) => void;
    }, {
        readonly id: "b.create-group";
        readonly label: "Group section";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly when: (ctx: ToolbarContext) => boolean;
        readonly run: (ctx: ToolbarContext) => void;
    }];
}, {
    readonly id: "Z.b.reordering";
    readonly actions: [{
        readonly id: "a.bring-to-front";
        readonly label: "Bring to Front";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly run: (ctx: ToolbarContext) => void;
    }, {
        readonly id: "b.bring-forward";
        readonly label: "Bring Forward";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly run: (ctx: ToolbarContext) => void;
    }, {
        readonly id: "c.send-backward";
        readonly label: "Send Backward";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly run: (ctx: ToolbarContext) => void;
    }, {
        readonly id: "c.send-to-back";
        readonly label: "Send to Back";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly run: (ctx: ToolbarContext) => void;
    }];
}, {
    readonly id: "a.clipboard";
    readonly actions: [{
        readonly id: "copy";
        readonly label: "Copy";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly run: (ctx: ToolbarContext) => void;
    }, {
        readonly id: "duplicate";
        readonly label: "Duplicate";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly run: (ctx: ToolbarContext) => void;
    }, {
        readonly id: "reload";
        readonly label: "Reload";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly when: (ctx: ToolbarContext) => boolean;
        readonly run: (ctx: ToolbarContext) => void;
    }];
}, {
    readonly id: "d.conversions";
    readonly actions: [{
        readonly id: "a.turn-into-linked-doc";
        readonly label: "Turn into linked doc";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly when: (ctx: ToolbarContext) => boolean;
        readonly run: (ctx: ToolbarContext) => void;
    }, {
        readonly id: "b.create-linked-doc";
        readonly label: "Create linked doc";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly when: (ctx: ToolbarContext) => boolean;
        readonly run: (ctx: ToolbarContext) => void;
    }];
}, {
    readonly id: "e.delete";
    readonly label: "Delete";
    readonly icon: import("lit-html").TemplateResult<1>;
    readonly variant: "destructive";
    readonly run: (ctx: ToolbarContext) => void;
}];
//# sourceMappingURL=more.d.ts.map