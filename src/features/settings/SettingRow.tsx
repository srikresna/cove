import type React from "react";
import { cn } from "../../lib/utils";

interface SettingRowProps {
  label: string;
  description?: string;
  control: React.ReactNode;
  className?: string;
}

export const SettingRow: React.FC<SettingRowProps> = ({
  label,
  description,
  control,
  className,
}) => (
  <div
    className={cn(
      "flex items-start justify-between gap-4 rounded-lg border bg-muted/40 p-4",
      className,
    )}
  >
    <div className="min-w-0">
      <div className="text-sm font-medium">{label}</div>
      {description && (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
    {control}
  </div>
);

interface SectionHeadingProps {
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  description,
  className,
}) => (
  <div className={cn("mb-4", className)}>
    <h3 className="font-display text-base font-medium text-foreground">{title}</h3>
    {description && (
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
    )}
  </div>
);
