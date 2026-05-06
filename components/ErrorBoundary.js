import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
                    <div className="text-6xl mb-6">😕</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
                    <p className="text-gray-600 mb-6 max-w-md">
                        We're having trouble loading this content. Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-brand-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                        Refresh Page
                    </button>
                    <p className="text-gray-400 text-sm mt-6">
                        If the problem persists, please{' '}
                        <a href="/contact" className="text-brand-blue hover:underline">
                            contact support
                        </a>
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;