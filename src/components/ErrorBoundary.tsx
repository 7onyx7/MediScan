import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sentry from '@sentry/react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global error boundary component to catch and handle unhandled errors
 * Provides user-friendly error UI and reports errors to monitoring service
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to console
    console.error('Application error:', error, errorInfo);

    // Save error logs to file system for debugging
    this.logErrorToFile(error, errorInfo);

    // Report error to monitoring service if available
    this.reportError(error, errorInfo);

    // Update state with error details
    this.setState({ errorInfo });
  }

  /**
   * Log error details to a file for later debugging
   */
  async logErrorToFile(error: Error, errorInfo: ErrorInfo): Promise<void> {
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        componentStack: errorInfo.componentStack
      };

      const errorLogsDir = `${FileSystem.documentDirectory}error-logs/`;
      const dirInfo = await FileSystem.getInfoAsync(errorLogsDir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(errorLogsDir, { intermediates: true });
      }

      const errorFileName = `error_${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(
        `${errorLogsDir}${errorFileName}`,
        JSON.stringify(errorLog, null, 2)
      );
    } catch (err) {
      console.error('Failed to write error log:', err);
    }
  }

  /**
   * Report error to monitoring service
   */
  reportError(error: Error, errorInfo: ErrorInfo): void {
    // Integrate with error monitoring service like Sentry
    // Uncomment when you've set up Sentry
    // Sentry.captureException(error);
  }

  /**
   * Reset the error state and try to recover
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, use the default error UI
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorMessage}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={this.handleReset}
            >
              <Text style={styles.resetButtonText}>Try Again</Text>
            </TouchableOpacity>
            
            {__DEV__ && (
              <View style={styles.devInfo}>
                <Text style={styles.devTitle}>Developer Info:</Text>
                <Text style={styles.devText}>
                  {this.state.error?.stack}
                </Text>
                <Text style={styles.devText}>
                  {this.state.errorInfo?.componentStack}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E53935',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 24,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  devInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#ECEFF1',
    borderRadius: 4,
  },
  devTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  devText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#37474F',
  },
});

export default ErrorBoundary;