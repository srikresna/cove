import type React from "react";
import type { Tag } from "../../../domain/tag/Tag";
import { TagChip as SharedTagChip } from "../../tags/TagChip";

export const TagChip: React.FC<{ tag: Tag; onRemove?: () => void }> = ({ tag, onRemove }) => (
  <SharedTagChip name={tag.name} color={tag.color} onRemove={onRemove} />
);
