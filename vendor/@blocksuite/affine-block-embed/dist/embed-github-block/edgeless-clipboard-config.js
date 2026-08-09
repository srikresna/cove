import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import {} from '@blocksuite/store';
export class EdgelessClipboardEmbedGithubConfig extends EdgelessClipboardConfig {
    static { this.key = 'affine:embed-github'; }
    createBlock(githubEmbed) {
        if (!this.surface)
            return null;
        const { xywh, style, owner, repo, githubType, githubId, url, caption, image, status, statusReason, title, description, createdAt, assignees, } = githubEmbed.props;
        const embedGithubId = this.crud.addBlock('affine:embed-github', {
            xywh,
            style,
            owner,
            repo,
            githubType,
            githubId,
            url,
            caption,
            image,
            status,
            statusReason,
            title,
            description,
            createdAt,
            assignees,
        }, this.surface.model.id);
        return embedGithubId;
    }
}
