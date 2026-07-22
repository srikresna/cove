import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { MESSAGES } from "../constants/messages";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught Error Boundary catch:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-cream-paper p-8 text-center font-gelica">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] border-[1.5px] border-charcoal bg-red-100 text-red-600 shadow-card-subtle"
            aria-hidden="true"
          >
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-extrabold text-cocoa-ink">
            {MESSAGES.SOMETHING_WENT_WRONG}
          </h2>
          <p className="mb-6 max-w-md text-xs font-medium text-slate-500">
            {this.state.error?.message || MESSAGES.ERROR_BOUNDARY_DESC}
          </p>
          <button
            type="button"
            aria-label={MESSAGES.RELOAD_APP}
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-[20px] border-[1.5px] border-charcoal bg-cream-paper px-6 py-2.5 text-xs font-bold text-cocoa-ink shadow-paper-lift transition-transform hover:scale-105"
          >
            <RefreshCw className="h-4 w-4 text-marker-orange" aria-hidden="true" />
            <span>{MESSAGES.RELOAD_APP}</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
