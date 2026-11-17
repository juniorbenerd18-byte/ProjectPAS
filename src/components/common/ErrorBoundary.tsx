import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

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
    console.error('Uncaught error handled by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetLocalData = () => {
    try {
      // Clear app-specific keys from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('schoolorg_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#0E1B2C] text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-[#17293E] rounded-2xl border border-[#E6DFD0] dark:border-[#283D56] p-6 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-[18px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
                Terjadi Kendala pada Tampilan
              </h2>
              <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] leading-relaxed">
                Sistem mendeteksi kendala rendering. Data Anda aman. Anda dapat memuat ulang atau mereset data cache lokal jika diperlukan.
              </p>
              {this.state.error?.message && (
                <div className="text-[11px] font-mono text-left bg-slate-100 dark:bg-[#0E1B2C] p-2.5 rounded-lg border border-[#E6DFD0] dark:border-[#283D56] text-slate-700 dark:text-slate-300 overflow-x-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 min-h-[42px] px-4 rounded-xl bg-[#1F3A5F] hover:bg-[#162a45] text-white text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Muat Ulang</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetLocalData}
                className="flex-1 min-h-[42px] px-4 rounded-xl border border-[#E6DFD0] dark:border-[#283D56] bg-white dark:bg-[#17293E] hover:bg-slate-50 dark:hover:bg-[#203650] text-[#1F3A5F] dark:text-[#FAF6EE] text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
