import { FileText } from "lucide-react";
import type React from "react";
import { CUSTOM_ICON_PREFIX } from "../constants/app";
import { cn } from "../lib/utils";
import { useCustomIconStore } from "../store/useCustomIconStore";

export const NoteIcon: React.FC<{
  icon: string | null | undefined;
  className?: string;
  fallback?: boolean;
}> = ({ icon, className, fallback = true }) => {
  const customId = icon?.startsWith(CUSTOM_ICON_PREFIX)
    ? icon.slice(CUSTOM_ICON_PREFIX.length).toLowerCase()
    : null;
  const dataUrl = useCustomIconStore((s) => (customId ? s.icons[customId]?.dataUrl : undefined));

  if (dataUrl) {
    return (
      <img
        src={dataUrl}
        alt=""
        aria-hidden="true"
        className={cn("shrink-0 rounded-sm object-cover", className)}
      />
    );
  }
  if (icon && !customId) return <>{icon}</>;
  return fallback ? (
    <FileText className={cn("shrink-0 text-muted-foreground", className)} aria-hidden="true" />
  ) : null;
};
