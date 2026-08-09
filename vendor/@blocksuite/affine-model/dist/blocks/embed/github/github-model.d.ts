export type EmbedGithubBlockUrlData = {
    image: string | null;
    status: string | null;
    statusReason: string | null;
    title: string | null;
    description: string | null;
    createdAt: string | null;
    assignees: string[] | null;
};
export declare const EmbedGithubStyles: ["vertical", "horizontal", "list", "cube"];
export type EmbedGithubBlockProps = {
    style: (typeof EmbedGithubStyles)[number];
    owner: string;
    repo: string;
    githubType: 'issue' | 'pr';
    githubId: string;
    url: string;
    caption: string | null;
} & EmbedGithubBlockUrlData;
declare const EmbedGithubModel_base: {
    new (): import("@blocksuite/std/gfx").GfxBlockElementModel<import("../../../index.js").EmbedProps<EmbedGithubBlockProps>>;
};
export declare class EmbedGithubModel extends EmbedGithubModel_base {
}
export {};
//# sourceMappingURL=github-model.d.ts.map