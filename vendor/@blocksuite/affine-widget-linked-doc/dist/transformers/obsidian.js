import { FootNoteReferenceParamsSchema } from '@blocksuite/affine-model';
import { BlockMarkdownAdapterExtension, createAttachmentBlockSnapshot, FULL_FILE_PATH_KEY, getImageFullPath, MarkdownAdapter, MarkdownASTToDeltaExtension, normalizeFilePathReference, } from '@blocksuite/affine-shared/adapters';
import { extMimeMap, nanoid } from '@blocksuite/store';
import { blobsFromAssets, } from './import-batch.js';
import { bindImportedAssetsToJob, createMarkdownImportJob, getProvider, isSystemImportPath, parseFrontmatter, stageImportedAsset, } from './markdown.js';
const CALLOUT_TYPE_MAP = {
    note: '💡',
    info: 'ℹ️',
    tip: '🔥',
    hint: '✅',
    important: '‼️',
    warning: '⚠️',
    caution: '⚠️',
    attention: '⚠️',
    danger: '⚠️',
    error: '🚨',
    bug: '🐛',
    example: '📌',
    quote: '💬',
    cite: '💬',
    abstract: '📋',
    summary: '📋',
    todo: '☑️',
    success: '✅',
    check: '✅',
    done: '✅',
    failure: '❌',
    fail: '❌',
    missing: '❌',
    question: '❓',
    help: '❓',
    faq: '❓',
};
const AMBIGUOUS_PAGE_LOOKUP = '__ambiguous__';
const DEFAULT_CALLOUT_EMOJI = '💡';
const OBSIDIAN_TEXT_FOOTNOTE_URL_PREFIX = 'data:text/plain;charset=utf-8,';
const OBSIDIAN_ATTACHMENT_EMBED_TAG = 'obsidian-attachment';
function normalizeLookupKey(value) {
    return normalizeFilePathReference(value).toLowerCase();
}
function stripMarkdownExtension(value) {
    return value.replace(/\.md$/i, '');
}
function basename(value) {
    return normalizeFilePathReference(value).split('/').pop() ?? value;
}
function parseObsidianTarget(rawTarget) {
    const normalizedTarget = normalizeFilePathReference(rawTarget);
    const match = normalizedTarget.match(/^([^#^]+)([#^].*)?$/);
    return {
        path: match?.[1]?.trim() ?? normalizedTarget,
        fragment: match?.[2] ?? null,
    };
}
function extractTitleAndEmoji(rawTitle) {
    const SINGLE_LEADING_EMOJI_RE = /^[\s\u200b]*((?:[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200b]|\u200d|\ufe0f)+)/u;
    let currentTitle = rawTitle;
    let extractedEmojiClusters = '';
    let emojiMatch;
    while ((emojiMatch = currentTitle.match(SINGLE_LEADING_EMOJI_RE))) {
        const matchedCluster = emojiMatch[1].trim();
        extractedEmojiClusters +=
            (extractedEmojiClusters ? ' ' : '') + matchedCluster;
        currentTitle = currentTitle.slice(emojiMatch[0].length);
    }
    return {
        title: currentTitle.trim(),
        emoji: extractedEmojiClusters || null,
    };
}
function preprocessTitleHeader(markdown) {
    return markdown.replace(/^(\s*#\s+)(.*)$/m, (_, headerPrefix, titleContent) => {
        const { title: cleanTitle } = extractTitleAndEmoji(titleContent);
        return `${headerPrefix}${cleanTitle}`;
    });
}
function preprocessObsidianCallouts(markdown) {
    return markdown.replace(/^(> *)\[!([^\]\n]+)\](?:[+-]?)([^\n]*)/gm, (_, prefix, type, rest) => {
        const calloutToken = CALLOUT_TYPE_MAP[type.trim().toLowerCase()] ?? DEFAULT_CALLOUT_EMOJI;
        const title = rest.trim();
        return title
            ? `${prefix}[!${calloutToken}] ${title}`
            : `${prefix}[!${calloutToken}]`;
    });
}
function isStructuredFootnoteDefinition(content) {
    try {
        return FootNoteReferenceParamsSchema.safeParse(JSON.parse(content.trim()))
            .success;
    }
    catch {
        return false;
    }
}
function splitFootnoteTextContent(content) {
    const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);
    const title = lines[0] ?? content.trim();
    const description = lines.slice(1).join('\n').trim();
    return {
        title,
        ...(description ? { description } : {}),
    };
}
function createTextFootnoteDefinition(content) {
    const normalizedContent = content.trim();
    const { title, description } = splitFootnoteTextContent(normalizedContent);
    return JSON.stringify({
        type: 'url',
        url: encodeURIComponent(`${OBSIDIAN_TEXT_FOOTNOTE_URL_PREFIX}${encodeURIComponent(normalizedContent)}`),
        title,
        ...(description ? { description } : {}),
    });
}
function parseFootnoteDefLine(line) {
    if (!line.startsWith('[^'))
        return null;
    const closeBracketIndex = line.indexOf(']:', 2);
    if (closeBracketIndex <= 2)
        return null;
    const identifier = line.slice(2, closeBracketIndex);
    if (!identifier || identifier.includes(']'))
        return null;
    let contentStart = closeBracketIndex + 2;
    while (contentStart < line.length &&
        (line[contentStart] === ' ' || line[contentStart] === '\t')) {
        contentStart += 1;
    }
    return {
        identifier,
        content: line.slice(contentStart),
    };
}
function extractObsidianFootnotes(markdown) {
    const lines = markdown.split('\n');
    const output = [];
    const footnotes = [];
    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const definition = parseFootnoteDefLine(line);
        if (!definition) {
            output.push(line);
            continue;
        }
        const { identifier } = definition;
        const contentLines = [definition.content];
        while (index + 1 < lines.length) {
            const nextLine = lines[index + 1];
            if (/^(?: {1,4}|\t)/.test(nextLine)) {
                contentLines.push(nextLine.replace(/^(?: {1,4}|\t)/, ''));
                index += 1;
                continue;
            }
            if (nextLine.trim() === '' &&
                index + 2 < lines.length &&
                /^(?: {1,4}|\t)/.test(lines[index + 2])) {
                contentLines.push('');
                index += 1;
                continue;
            }
            break;
        }
        const content = contentLines.join('\n').trim();
        footnotes.push(`[^${identifier}]: ${!content || isStructuredFootnoteDefinition(content)
            ? content
            : createTextFootnoteDefinition(content)}`);
    }
    return { content: output.join('\n'), footnotes };
}
function buildLookupKeys(targetPath, currentFilePath) {
    const parsedTargetPath = normalizeFilePathReference(targetPath);
    if (!parsedTargetPath) {
        return [];
    }
    const keys = new Set();
    const addPathVariants = (value) => {
        const normalizedValue = normalizeFilePathReference(value);
        if (!normalizedValue) {
            return;
        }
        keys.add(normalizedValue);
        keys.add(stripMarkdownExtension(normalizedValue));
        const fileName = basename(normalizedValue);
        keys.add(fileName);
        keys.add(stripMarkdownExtension(fileName));
        const cleanTitle = extractTitleAndEmoji(stripMarkdownExtension(fileName)).title;
        if (cleanTitle) {
            keys.add(cleanTitle);
        }
    };
    addPathVariants(parsedTargetPath);
    if (currentFilePath) {
        addPathVariants(getImageFullPath(currentFilePath, parsedTargetPath));
    }
    return Array.from(keys).map(normalizeLookupKey);
}
function registerPageLookup(pageLookupMap, key, pageId) {
    const normalizedKey = normalizeLookupKey(key);
    if (!normalizedKey) {
        return;
    }
    const existing = pageLookupMap.get(normalizedKey);
    if (existing && existing !== pageId) {
        pageLookupMap.set(normalizedKey, AMBIGUOUS_PAGE_LOOKUP);
        return;
    }
    pageLookupMap.set(normalizedKey, pageId);
}
function resolvePageIdFromLookup(pageLookupMap, rawTarget, currentFilePath) {
    const { path } = parseObsidianTarget(rawTarget);
    for (const key of buildLookupKeys(path, currentFilePath)) {
        const targetPageId = pageLookupMap.get(key);
        if (!targetPageId || targetPageId === AMBIGUOUS_PAGE_LOOKUP) {
            continue;
        }
        return targetPageId;
    }
    return null;
}
function resolveWikilinkDisplayTitle(rawAlias, pageEmoji) {
    if (!rawAlias) {
        return undefined;
    }
    const { title: aliasTitle, emoji: aliasEmoji } = extractTitleAndEmoji(rawAlias);
    if (aliasEmoji && aliasEmoji === pageEmoji) {
        return aliasTitle;
    }
    return rawAlias;
}
function isImageAssetPath(path) {
    const extension = path.split('.').at(-1)?.toLowerCase() ?? '';
    return extMimeMap.get(extension)?.startsWith('image/') ?? false;
}
function encodeMarkdownPath(path) {
    return encodeURI(path).replaceAll('(', '%28').replaceAll(')', '%29');
}
function escapeMarkdownLabel(label) {
    return label.replace(/[[\]\\]/g, '\\$&');
}
function isObsidianSizeAlias(alias) {
    return !!alias && /^\d+(?:x\d+)?$/i.test(alias.trim());
}
function getEmbedLabel(rawAlias, targetPath, fallbackToFileName) {
    if (!rawAlias || isObsidianSizeAlias(rawAlias)) {
        return fallbackToFileName
            ? stripMarkdownExtension(basename(targetPath))
            : '';
    }
    return rawAlias.trim();
}
function createAssetLookup(pathBlobIdMap, vaultRoot, attachmentFolderPath) {
    const exact = new Map();
    const byBasename = new Map();
    for (const [path, blobId] of pathBlobIdMap) {
        const entry = { blobId, path };
        exact.set(normalizeLookupKey(path), entry);
        const name = normalizeLookupKey(basename(path));
        const existing = byBasename.get(name);
        if (!existing) {
            byBasename.set(name, entry);
        }
        else if (existing !== AMBIGUOUS_PAGE_LOOKUP &&
            existing.blobId !== blobId) {
            byBasename.set(name, AMBIGUOUS_PAGE_LOOKUP);
        }
    }
    return {
        resolve(targetPath, currentFilePath) {
            const normalizedTarget = normalizeFilePathReference(targetPath);
            const rootPath = vaultRoot
                ? `${vaultRoot}/${normalizedTarget}`
                : normalizedTarget;
            const candidates = [
                getImageFullPath(currentFilePath, normalizedTarget),
                rootPath,
            ];
            if (attachmentFolderPath) {
                candidates.push(vaultRoot
                    ? `${vaultRoot}/${attachmentFolderPath}/${basename(normalizedTarget)}`
                    : `${attachmentFolderPath}/${basename(normalizedTarget)}`);
            }
            for (const candidate of candidates) {
                const resolved = exact.get(normalizeLookupKey(candidate));
                if (resolved)
                    return resolved;
            }
            const match = byBasename.get(normalizeLookupKey(basename(normalizedTarget)));
            return match && match !== AMBIGUOUS_PAGE_LOOKUP ? match : null;
        },
    };
}
function createObsidianAttach(embed) {
    return `<!-- ${OBSIDIAN_ATTACHMENT_EMBED_TAG} ${encodeURIComponent(JSON.stringify(embed))} -->`;
}
function parseObsidianAttach(value) {
    const match = value.match(new RegExp(`^<!-- ${OBSIDIAN_ATTACHMENT_EMBED_TAG} ([^ ]+) -->$`));
    if (!match?.[1])
        return null;
    try {
        const parsed = JSON.parse(decodeURIComponent(match[1]));
        if (!parsed.blobId || !parsed.fileName) {
            return null;
        }
        return parsed;
    }
    catch {
        return null;
    }
}
function parseWikiLinkAt(source, startIdx, embedded) {
    const opener = embedded ? '![[' : '[[';
    if (!source.startsWith(opener, startIdx))
        return null;
    const contentStart = startIdx + opener.length;
    const closeIndex = source.indexOf(']]', contentStart);
    if (closeIndex === -1)
        return null;
    const inner = source.slice(contentStart, closeIndex);
    const separatorIdx = inner.indexOf('|');
    const rawTarget = separatorIdx === -1 ? inner : inner.slice(0, separatorIdx);
    const rawAlias = separatorIdx === -1 ? undefined : inner.slice(separatorIdx + 1);
    if (rawTarget.length === 0 ||
        rawTarget.includes(']') ||
        rawTarget.includes('|') ||
        rawAlias?.includes(']')) {
        return null;
    }
    return {
        raw: source.slice(startIdx, closeIndex + 2),
        rawTarget,
        rawAlias,
        endIdx: closeIndex + 2,
    };
}
function replaceWikiLinks(source, embedded, replacer) {
    const opener = embedded ? '![[' : '[[';
    let cursor = 0;
    let output = '';
    while (cursor < source.length) {
        const matchStart = source.indexOf(opener, cursor);
        if (matchStart === -1) {
            output += source.slice(cursor);
            break;
        }
        output += source.slice(cursor, matchStart);
        const match = parseWikiLinkAt(source, matchStart, embedded);
        if (!match) {
            output += source.slice(matchStart, matchStart + opener.length);
            cursor = matchStart + opener.length;
            continue;
        }
        output += replacer(match);
        cursor = match.endIdx;
    }
    return output;
}
function preprocessObsidianEmbeds(markdown, filePath, pageLookupMap, assetLookup) {
    return replaceWikiLinks(markdown, true, ({ raw, rawTarget, rawAlias }) => {
        const targetPageId = resolvePageIdFromLookup(pageLookupMap, rawTarget, filePath);
        if (targetPageId) {
            return `[[${rawTarget}${rawAlias ? `|${rawAlias}` : ''}]]`;
        }
        const { path } = parseObsidianTarget(rawTarget);
        if (!path)
            return raw;
        const resolvedAsset = assetLookup.resolve(path, filePath);
        const assetPath = resolvedAsset?.path ?? getImageFullPath(filePath, path);
        const encodedPath = encodeMarkdownPath(resolvedAsset ? `/${assetPath}` : path);
        if (isImageAssetPath(path)) {
            const alt = getEmbedLabel(rawAlias, path, false);
            return `![${escapeMarkdownLabel(alt)}](${encodedPath})`;
        }
        const label = getEmbedLabel(rawAlias, path, true);
        const blobId = resolvedAsset?.blobId;
        if (!blobId)
            return `[${escapeMarkdownLabel(label)}](${encodedPath})`;
        const extension = path.split('.').at(-1)?.toLowerCase() ?? '';
        return createObsidianAttach({
            blobId,
            fileName: basename(path),
            fileType: extMimeMap.get(extension) ?? '',
        });
    });
}
function preprocessObsidianMarkdown(markdown, filePath, pageLookupMap, assetLookup) {
    const { content: contentWithoutFootnotes, footnotes: extractedFootnotes } = extractObsidianFootnotes(markdown);
    const content = preprocessObsidianEmbeds(contentWithoutFootnotes, filePath, pageLookupMap, assetLookup);
    const normalizedMarkdown = preprocessTitleHeader(preprocessObsidianCallouts(content));
    if (extractedFootnotes.length === 0) {
        return normalizedMarkdown;
    }
    const trimmedMarkdown = normalizedMarkdown.replace(/\s+$/, '');
    return `${trimmedMarkdown}\n\n${extractedFootnotes.join('\n\n')}\n`;
}
function isObsidianAttachmentEmbedNode(node) {
    return node.type === 'html' && !!parseObsidianAttach(node.value);
}
export const obsidianAttachmentEmbedMarkdownAdapterMatcher = BlockMarkdownAdapterExtension({
    flavour: 'obsidian:attachment-embed',
    toMatch: o => isObsidianAttachmentEmbedNode(o.node),
    fromMatch: () => false,
    toBlockSnapshot: {
        enter: (o, context) => {
            if (!isObsidianAttachmentEmbedNode(o.node)) {
                return;
            }
            const attachment = parseObsidianAttach(o.node.value);
            if (!attachment) {
                return;
            }
            const assetFile = context.assets?.getAssets().get(attachment.blobId);
            context.walkerContext
                .openNode(createAttachmentBlockSnapshot({
                id: nanoid(),
                props: {
                    name: attachment.fileName,
                    size: assetFile?.size ?? 0,
                    type: attachment.fileType ||
                        assetFile?.type ||
                        'application/octet-stream',
                    sourceId: attachment.blobId,
                    embed: false,
                    style: 'horizontalThin',
                    footnoteIdentifier: null,
                },
            }), 'children')
                .closeNode();
            o.node.type =
                'obsidianAttachmentEmbed';
        },
    },
    fromBlockSnapshot: {},
});
export const obsidianWikilinkToDeltaMatcher = MarkdownASTToDeltaExtension({
    name: 'obsidian-wikilink',
    match: ast => ast.type === 'text',
    toDelta: (ast, context) => {
        const textNode = ast;
        if (!textNode.value) {
            return [];
        }
        const nodeContent = textNode.value;
        const deltas = [];
        let cursor = 0;
        while (cursor < nodeContent.length) {
            const matchStart = nodeContent.indexOf('[[', cursor);
            if (matchStart === -1) {
                deltas.push({ insert: nodeContent.substring(cursor) });
                break;
            }
            if (matchStart > cursor) {
                deltas.push({
                    insert: nodeContent.substring(cursor, matchStart),
                });
            }
            const linkMatch = parseWikiLinkAt(nodeContent, matchStart, false);
            if (!linkMatch) {
                deltas.push({ insert: '[[' });
                cursor = matchStart + 2;
                continue;
            }
            const targetPageName = linkMatch.rawTarget.trim();
            const alias = linkMatch.rawAlias?.trim();
            const currentFilePath = context.configs.get(FULL_FILE_PATH_KEY);
            const targetPageId = resolvePageIdFromLookup({ get: key => context.configs.get(`obsidian:pageId:${key}`) }, targetPageName, typeof currentFilePath === 'string' ? currentFilePath : undefined);
            if (targetPageId) {
                const pageEmoji = context.configs.get('obsidian:pageEmoji:' + targetPageId);
                const displayTitle = resolveWikilinkDisplayTitle(alias, pageEmoji);
                deltas.push({
                    insert: ' ',
                    attributes: {
                        reference: {
                            type: 'LinkedPage',
                            pageId: targetPageId,
                            ...(displayTitle ? { title: displayTitle } : {}),
                        },
                    },
                });
            }
            else {
                deltas.push({ insert: linkMatch.raw });
            }
            cursor = linkMatch.endIdx;
        }
        return deltas;
    },
});
function getVaultRoot(paths) {
    const first = paths[0]?.split('/').find(Boolean);
    return first && paths.every(path => path.startsWith(`${first}/`))
        ? first
        : '';
}
function isObsidianConfigPath(path) {
    return normalizeFilePathReference(path)
        .split('/')
        .some(segment => segment === '.obsidian');
}
async function getAttachmentFolderPath(importedFiles) {
    const appConfig = importedFiles.find(file => {
        const path = normalizeFilePathReference(file.webkitRelativePath || file.name);
        return (path.endsWith('/.obsidian/app.json') || path === '.obsidian/app.json');
    });
    if (!appConfig)
        return undefined;
    try {
        const parsed = JSON.parse(await appConfig.text());
        return typeof parsed.attachmentFolderPath === 'string' &&
            parsed.attachmentFolderPath.trim()
            ? normalizeFilePathReference(parsed.attachmentFolderPath.trim())
            : undefined;
    }
    catch {
        return undefined;
    }
}
function buildObsidianFolders(markdownFiles, vaultRoot) {
    const folders = new Map();
    for (const file of markdownFiles) {
        const normalizedPath = normalizeFilePathReference(file.fullPath);
        const vaultPath = vaultRoot && normalizedPath.startsWith(`${vaultRoot}/`)
            ? normalizedPath.slice(vaultRoot.length + 1)
            : normalizedPath;
        const parts = vaultPath.split('/').filter(Boolean);
        parts.pop();
        if (parts.length === 0)
            continue;
        let parentPath;
        for (const name of parts) {
            const path = parentPath ? `${parentPath}/${name}` : name;
            folders.set(path, { path, name, parentPath });
            parentPath = path;
        }
        folders.set(`${parentPath}/__doc__${file.pageId}`, {
            path: `${parentPath}/__doc__${file.pageId}`,
            name: `__doc__${file.pageId}`,
            parentPath,
            pageId: file.pageId,
        });
    }
    return folders.size ? Array.from(folders.values()) : undefined;
}
export async function planObsidianVault({ collection, schema, importedFiles, extensions, }) {
    const provider = getProvider([
        obsidianWikilinkToDeltaMatcher,
        obsidianAttachmentEmbedMarkdownAdapterMatcher,
        ...extensions,
    ]);
    const docIds = [];
    const docs = [];
    const docEmojis = new Map();
    const pendingAssets = new Map();
    const pendingPathBlobIdMap = new Map();
    const markdownBlobs = [];
    const pageLookupMap = new Map();
    const importedPaths = importedFiles.map(file => file.webkitRelativePath || file.name);
    const vaultRoot = getVaultRoot(importedPaths);
    const attachmentFolderPath = await getAttachmentFolderPath(importedFiles);
    for (const file of importedFiles) {
        const filePath = file.webkitRelativePath || file.name;
        if (isSystemImportPath(filePath) || isObsidianConfigPath(filePath)) {
            continue;
        }
        if (file.name.endsWith('.md')) {
            const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            const markdown = await file.text();
            const { content, meta } = parseFrontmatter(markdown);
            const documentTitleCandidate = meta.title ?? fileNameWithoutExt;
            const { title: preferredTitle, emoji: leadingEmoji } = extractTitleAndEmoji(documentTitleCandidate);
            const newPageId = collection.idGenerator();
            registerPageLookup(pageLookupMap, filePath, newPageId);
            registerPageLookup(pageLookupMap, stripMarkdownExtension(filePath), newPageId);
            registerPageLookup(pageLookupMap, file.name, newPageId);
            registerPageLookup(pageLookupMap, fileNameWithoutExt, newPageId);
            registerPageLookup(pageLookupMap, documentTitleCandidate, newPageId);
            registerPageLookup(pageLookupMap, preferredTitle, newPageId);
            if (leadingEmoji) {
                docEmojis.set(newPageId, leadingEmoji);
            }
            markdownBlobs.push({
                filename: file.name,
                contentBlob: file,
                fullPath: filePath,
                pageId: newPageId,
                preferredTitle,
                content,
                meta,
            });
        }
        else {
            await stageImportedAsset({
                pendingAssets,
                pendingPathBlobIdMap,
                path: filePath,
                content: file,
                fileName: file.name,
            });
        }
    }
    const assetLookup = createAssetLookup(pendingPathBlobIdMap, vaultRoot, attachmentFolderPath);
    for (const existingDocMeta of collection.meta.docMetas) {
        if (existingDocMeta.title) {
            registerPageLookup(pageLookupMap, existingDocMeta.title, existingDocMeta.id);
        }
    }
    await Promise.all(markdownBlobs.map(async (markdownFile) => {
        const { fullPath, pageId: predefinedId, preferredTitle, content, meta, } = markdownFile;
        const job = createMarkdownImportJob({
            collection,
            schema,
            preferredTitle,
            fullPath,
        });
        for (const [lookupKey, id] of pageLookupMap.entries()) {
            if (id === AMBIGUOUS_PAGE_LOOKUP) {
                continue;
            }
            job.adapterConfigs.set(`obsidian:pageId:${lookupKey}`, id);
        }
        for (const [id, emoji] of docEmojis.entries()) {
            job.adapterConfigs.set('obsidian:pageEmoji:' + id, emoji);
        }
        bindImportedAssetsToJob(job, pendingAssets, pendingPathBlobIdMap);
        const preprocessedMarkdown = preprocessObsidianMarkdown(content, fullPath, pageLookupMap, assetLookup);
        const mdAdapter = new MarkdownAdapter(job, provider);
        const snapshot = await mdAdapter.toDocSnapshot({
            file: preprocessedMarkdown,
            assets: job.assetsManager,
        });
        if (snapshot) {
            snapshot.meta.id = predefinedId;
            docs.push({
                id: predefinedId,
                snapshot,
                meta: { ...meta, title: preferredTitle, trash: false },
            });
            docIds.push(predefinedId);
        }
    }));
    return {
        docIds,
        docEmojis,
        batch: {
            docs,
            blobs: await blobsFromAssets(pendingAssets, pendingPathBlobIdMap),
            folders: buildObsidianFolders(markdownBlobs, vaultRoot),
            icons: Array.from(docEmojis, ([docId, emoji]) => ({
                docId,
                icon: { type: 'emoji', unicode: emoji },
            })),
            done: true,
        },
    };
}
export const ObsidianTransformer = {
    planObsidianVault,
};
