/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Compass, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'Terjadi gangguan pada konteks WebGL / 3D Engine.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Aether World-Web Runtime Error]:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#060A12] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#0B1220] border border-white/15 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/40 flex items-center justify-center text-sky-400 mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white font-display">
              Aether World-Web — Pemulihan Mesin 3D
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Konteks grafis WebGL sempat terputus atau mengalami jeda memori pada peramban Anda.
              Silakan muat ulang untuk kembali ke Lobby.
            </p>
            {this.state.errorMessage && (
              <div className="p-2.5 rounded-lg bg-slate-950 border border-white/10 text-[11px] font-mono-tabular text-slate-400 break-words">
                {this.state.errorMessage}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Muat Ulang Aether World-Web</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
