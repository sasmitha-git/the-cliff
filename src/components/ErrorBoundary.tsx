"use client";

import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-cliff-bg min-h-screen flex items-center justify-center">
            <div className="bg-cliff-surface border border-cliff-border rounded-lg p-6 max-w-sm text-center">
              <p className="text-cliff-text font-syne font-bold mb-2">Something went wrong</p>
              <p className="text-cliff-subtle text-sm mb-4">{this.state.error?.message || "An unexpected error occurred"}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-cliff-accent text-cliff-bg px-4 py-2 rounded-lg font-dm font-bold hover:opacity-90 transition-opacity text-sm"
              >
                Reload page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Lightweight error fallback for streams
export const StreamErrorFallback = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-cliff-bg/80 backdrop-blur">
    <div className="text-center">
      <p className="text-cliff-subtle text-sm font-dm">Stream unavailable</p>
    </div>
  </div>
);

// Lightweight error fallback for components
export const ComponentErrorFallback = () => (
  <div className="flex items-center justify-center p-6 bg-cliff-surface border border-cliff-border rounded-lg">
    <p className="text-cliff-faint text-xs text-center">Failed to load content</p>
  </div>
);
