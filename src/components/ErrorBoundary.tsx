import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Check if it's a Firestore permission error (JSON stringified)
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.error && parsed.operationType) {
        this.setState({ errorInfo: `Firestore ${parsed.operationType} failed: ${parsed.error}` });
      }
    } catch (e) {
      // Not a JSON error
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-cool-gray mb-4 tracking-tight">Something went wrong</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              {this.state.errorInfo || this.state.error?.message || "An unexpected error occurred in the Liminality engine."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-cool-gray text-white text-[10px] font-bold rounded-2xl uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
