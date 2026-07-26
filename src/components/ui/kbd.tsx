import type * as React from "react";
import { cn } from "../../lib/utils";

const Kbd = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <kbd
    className={cn(
      "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-sm border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground",
      className,
    )}
    {...props}
  />
);

export { Kbd };
