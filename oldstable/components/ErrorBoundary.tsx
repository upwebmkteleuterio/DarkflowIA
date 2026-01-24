
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  // Fix: children should be optional to avoid "missing children" errors in JSX contexts
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

// Fix: Explicitly declare props and state to satisfy strict TypeScript checks for class components
class ErrorBoundary extends Component<Props, State> {
  // Fix: Declare state and props properties
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    // Fix: Initialize state
    this.state = {
      hasError: false
    };
    // Fix: Assign props explicitly
    this.props = props;
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render(): ReactNode {
    // Fix: Use this.state.hasError which is now properly recognized
    if (this.state.hasError) {
      // Fix: Correctly access the fallback prop
      return this.props.fallback || (
        <div className="w-full h-full min-h-[200px] p-6 flex flex-col gap-4 animate-pulse">
          <div className="h-8 bg-surface-dark border border-border-dark rounded-xl w-1/3"></div>
          <div className="space-y-3">
            <div className="h-32 bg-surface-dark border border-border-dark rounded-2xl w-full"></div>
            <div className="flex gap-4">
              <div className="h-10 bg-surface-dark border border-border-dark rounded-xl flex-1"></div>
              <div className="h-10 bg-surface-dark border border-border-dark rounded-xl flex-1"></div>
            </div>
          </div>
          <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest text-center mt-2">
            Ocorreu um erro neste componente. Tentando recuperar...
          </div>
        </div>
      );
    }

    // Fix: Return children prop which is now recognized and optional
    return this.props.children;
  }
}

export default ErrorBoundary;
