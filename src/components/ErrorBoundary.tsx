import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || '未知错误' };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('组件渲染错误:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="p-4 bg-red-50 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">页面出现了一点问题</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm">
            {this.state.message}。数据已保存在浏览器本地，不用担心丢失。
          </p>
          <button
            onClick={this.handleReload}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> 重新加载
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
