import React from 'react';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and state
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    // Reset error state and retry
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: '#f8fafc',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              ⚠️
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: '8px'
            }}>
              Something went wrong
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              marginBottom: '24px'
            }}>
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            
            {this.state.error && (
              <details style={{
                textAlign: 'left',
                backgroundColor: '#f1f5f9',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                fontSize: '14px',
                color: '#475569'
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
                  Error Details
                </summary>
                <pre style={{
                  margin: '8px 0 0 0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <Button
                onClick={this.handleRetry}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                style={{
                  backgroundColor: '#64748b',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;