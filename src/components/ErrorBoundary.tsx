import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { MESSAGES } from "../constants/messages";
import { Logger } from "../services/Logger";
import { Button } from "./ui/button";

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
    Logger.error("Uncaught Error Boundary catch", error, {
      componentStack: errorInfo.componentStack,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-background p-4">
          <div className="w-full max-w-sm space-y-5 rounded-lg border bg-card p-8 shadow-sm">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              aria-hidden="true"
            >
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-center font-display text-2xl font-medium tracking-tight">
                {MESSAGES.SOMETHING_WENT_WRONG}
              </h2>
              <p className="text-center text-sm text-muted-foreground">
                {this.state.error?.message || MESSAGES.ERROR_BOUNDARY_DESC}
              </p>
            </div>
            <Button
              type="button"
              aria-label={MESSAGES.RELOAD_APP}
              onClick={() => window.location.reload()}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>{MESSAGES.RELOAD_APP}</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
