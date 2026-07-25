import type React from "react";
import { MESSAGES } from "../../constants/messages";

export const MigrationScreen: React.FC = () => (
  <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-cream-paper font-gelica">
    <div
      className="h-10 w-10 animate-spin rounded-full border-[3px] border-charcoal/20 border-t-marker-orange"
      aria-hidden="true"
    />
    <p className="text-sm font-semibold text-cocoa-ink">{MESSAGES.VAULT_MIGRATING}</p>
  </div>
);
