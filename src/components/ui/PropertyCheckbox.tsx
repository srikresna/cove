import type React from "react";
import { cn } from "../../lib/utils";

const UNCHECKED_PATH =
  "M6 3.25C4.48122 3.25 3.25 4.48122 3.25 6V18C3.25 19.5188 4.48122 20.75 6 20.75H18C19.5188 20.75 20.75 19.5188 20.75 18V6C20.75 4.48122 19.5188 3.25 18 3.25H6ZM4.75 6C4.75 5.30964 5.30964 4.75 6 4.75H18C18.6904 4.75 19.25 5.30964 19.25 6V18C19.25 18.6904 18.6904 19.25 18 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V6Z";

const CHECKED_PATH =
  "M3.25 6C3.25 4.48122 3.25 3.25 6 3.25H18C19.5188 3.25 20.75 4.48122 20.75 6V18C20.75 19.5188 19.5188 20.75 18 20.75H6C4.48122 20.75 3.25 19.5188 3.25 18V6ZM16.5303 9.53033C16.8232 9.23744 16.8232 8.76256 16.5303 8.46967C16.2374 8.17678 15.7626 8.17678 15.4697 8.46967L10.5 13.4393L9.03033 11.9697C8.73744 11.6768 8.26256 11.6768 7.96967 11.9697C7.67678 12.2626 7.67678 12.7374 7.96967 13.0303L9.96967 15.0303C10.2626 15.3232 10.7374 15.3232 11.0303 15.0303L16.5303 9.53033Z";

const INDETERMINATE_PATH =
  "M6 3.25C4.48122 3.25 3.25 4.48122 3.25 6V18C3.25 19.5188 4.48122 20.75 6 20.75H18C19.5188 20.75 20.75 19.5188 20.75 18V6C20.75 4.48122 19.5188 3.25 18 3.25H6ZM8.54 11.25C8.12579 11.25 7.79 11.5858 7.79 12C7.79 12.4142 8.12579 12.75 8.54 12.75H15.54C15.9542 12.75 16.29 12.4142 16.29 12C16.29 11.5858 15.9542 11.25 15.54 11.25H8.54Z";

/**
 * A 24px property checkbox: an SVG glyph inside a label whose invisible
 * native input covers the hit area — clicking anywhere on the label toggles,
 * and keyboard focus/space works through the input.
 */
export const PropertyCheckbox: React.FC<{
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
  className?: string;
  /** Extra content rendered inside the label (journal date, conflict pill...). */
  children?: React.ReactNode;
}> = ({ checked, indeterminate = false, onChange, ariaLabel, className, children }) => (
  <label
    className={cn(
      "relative inline-flex h-6 min-w-6 cursor-pointer items-center justify-start gap-0.5 text-muted-foreground",
      className,
    )}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6 shrink-0 transition-opacity hover:opacity-80 active:opacity-90"
      aria-hidden="true"
    >
      {checked ? (
        <path fillRule="evenodd" clipRule="evenodd" d={CHECKED_PATH} fill="#1e96eb" />
      ) : indeterminate ? (
        <path fillRule="evenodd" clipRule="evenodd" d={INDETERMINATE_PATH} fill="currentColor" />
      ) : (
        <path fillRule="evenodd" clipRule="evenodd" d={UNCHECKED_PATH} fill="currentColor" />
      )}
    </svg>
    {children}
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={ariaLabel}
      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
    />
  </label>
);
