import { Component } from "react";
import { Link } from "react-router-dom";
import Card from "../ui/Card";
import { Button, Icon } from "../ui/Button";
import { buttonClass } from "../ui/styles";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const fallbackUrl = this.props.fallbackUrl || "/";
      const fallbackLabel = this.props.fallbackLabel || "Go to homepage";

      return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <Card className="flex w-full max-w-md flex-col items-center px-6 py-10 text-center" role="alert">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Icon name="error" className="text-[26px]" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-950">Something went wrong</h2>
            <p className="mt-1 text-sm text-slate-500">
              An unexpected error occurred. You can reload the page or return to safety.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                variant="secondary"
                icon="refresh"
                onClick={() => window.location.reload()}
              >
                Reload
              </Button>
              <Link
                to={fallbackUrl}
                onClick={this.handleReset}
                className={buttonClass("primary")}
              >
                {fallbackLabel}
              </Link>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
