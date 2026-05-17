import { Component, type ErrorInfo, type ReactNode } from "react";

import i18n from "@/i18n/config";

type Props = { children: ReactNode; fallback?: ReactNode };

type State = { hasError: boolean; message: string };

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || "" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Route error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const detail = this.state.message || i18n.t("errors.generic");
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-8 text-center">
            <h1 className="text-lg font-semibold">{i18n.t("errors.viewCrashed")}</h1>
            <p className="max-w-md text-sm text-muted-foreground">{detail}</p>
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
              onClick={() => this.setState({ hasError: false, message: "" })}
            >
              {i18n.t("errors.tryAgain")}
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
