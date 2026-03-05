import { Component } from 'react'
import { RefreshCw } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 m-4 bg-red-50 rounded-2xl border border-red-100 min-h-[300px]">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-3xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-600 max-w-xs mb-6 leading-relaxed">An unexpected error occurred. Please try refreshing the page.</p>
        {import.meta.env.DEV && <pre className="text-left text-xs text-red-700 bg-red-100 rounded-xl p-3 mb-4 max-w-sm overflow-auto w-full">{this.state.error?.message}</pre>}
        <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors">
          <RefreshCw size={16} />
          Refresh Page
        </button>
      </div>
    )
  }
}
