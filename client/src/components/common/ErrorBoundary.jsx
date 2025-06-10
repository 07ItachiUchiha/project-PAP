import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { RefreshCcw, Home, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to monitoring service in production
    if (import.meta.env.MODE === 'production') {
      console.error('Error caught by boundary:', error, errorInfo);
      // You can send this to your error reporting service
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg w-full"
          >
            <div className="card-nature text-center p-8">
              {/* Animated Error Icon */}
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-terracotta-500 to-orange-500 text-white rounded-full mb-6 shadow-glow"
              >
                <AlertTriangle className="h-10 w-10" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-3xl font-display font-bold text-charcoal-800 mb-4"
              >
                Oops! Something went wrong
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-charcoal-600 mb-8 leading-relaxed"
              >
                We're sorry for the inconvenience. Our plants are still growing, 
                but it seems we've hit a little snag in our digital garden.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <button
                  onClick={this.handleRetry}
                  className="btn-nature group inline-flex items-center justify-center"
                >
                  <RefreshCcw className="w-5 h-5 mr-2 group-hover:animate-spin" />
                  Try Again
                </button>
                
                <Link
                  to="/"
                  className="btn-nature-outline group inline-flex items-center justify-center"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </Link>
              </motion.div>

              {/* Development Error Details */}
              {import.meta.env.DEV && this.state.error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="mt-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-left"
                >
                  <h3 className="text-sm font-semibold text-red-800 mb-2">
                    Development Error Details:
                  </h3>                  <pre className="text-xs text-red-700 overflow-auto max-h-40">
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
