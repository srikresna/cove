import type React from "react";
import type { Tag } from "../../../domain/tag/Tag";
import { TagChip as SharedTagChip } from "../../tags/TagChip";

/** Property-row tag chip — the shared anatomy, kept as a thin adapter for
 *  the existing `tag: Tag` call sites. */
export const TagChip: React.FC<{ tag: Tag; onRemove?: () => void }> = ({ tag, onRemove }) => (
  <SharedTagChip name={tag.name} color={tag.color} onRemove={onRemove} />
);
