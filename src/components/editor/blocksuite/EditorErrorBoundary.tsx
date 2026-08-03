import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Logger } from "../../../services/Logger";

interface Props {
  /** Bumped to reset the boundary (e.g. on note or mode switch). */
  resetKey: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string | null;
}

/**
 * Catches errors thrown by the BlockSuite editor (Lit web-component mount,
 * lifecycle, or a BlockSuite-internal throw) so a single editor crash shows a
 * localized fallback instead of taking down the whole app. The sidebar,
 * topbar, and note list remain interactive.
 *
 * `resetKey` lets a parent remount a recovered editor: changing it forces this
 * class back to the clean state via `componentDidUpdate`.
 */
export class EditorErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, message: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    Logger.error("Editor error boundary catch", error, {
      componentStack: errorInfo.componentStack,
    });
  }

  public componentDidUpdate(prevProps: Props): void {
    // A note/mode switch means the failing editor is gone; clear the error so
    // the new one can mount cleanly.
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, message: null });
    }
  }

  public render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex h-full w-full items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-5 rounded-lg border bg-card p-8 shadow-sm">
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"
            aria-hidden="true"
          >
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-center font-display text-xl font-medium tracking-tight">
              Editor failed to load
            </h2>
            <p className="text-center text-sm text-muted-foreground">
              {this.state.message ??
                "The editor hit an unexpected error. Reload it to continue editing."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: null })}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Reload editor</span>
          </button>
        </div>
      </div>
    );
  }
}

export default EditorErrorBoundary;
