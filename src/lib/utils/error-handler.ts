import { toast } from 'react-hot-toast';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AppError extends Error {
  severity?: ErrorSeverity;
  code?: string;
  details?: any;
  retry?: () => Promise<any>;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  private constructor() {
    // Set up global error handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
      window.addEventListener('error', this.handleGlobalError);
    }
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled promise rejection:', event.reason);
    this.handle(event.reason, 'error');
    event.preventDefault();
  };

  private handleGlobalError = (event: ErrorEvent) => {
    console.error('Global error:', event.error);
    this.handle(event.error, 'critical');
    event.preventDefault();
  };

  handle(error: Error | AppError | string, severity: ErrorSeverity = 'error', details?: any) {
    // Convert string errors to Error objects
    if (typeof error === 'string') {
      error = new Error(error);
    }

    // Add severity and details
    const appError = error as AppError;
    appError.severity = appError.severity || severity;
    appError.details = appError.details || details;

    // Log the error
    this.logError(appError);

    // Show user notification based on severity
    switch (severity) {
      case 'info':
        toast(appError.message, {
          icon: 'ℹ️',
          duration: 3000,
        });
        break;
      
      case 'warning':
        toast(appError.message, {
          icon: '⚠️',
          duration: 4000,
          style: {
            background: '#FEF3C7',
            color: '#92400E',
          },
        });
        break;
      
      case 'error':
        toast.error(appError.message, {
          duration: 5000,
          style: {
            background: '#FEE2E2',
            color: '#991B1B',
          },
        });
        break;
      
      case 'critical':
        toast.error(
          <div>
            <strong>Critical Error</strong>
            <p className="text-sm mt-1">{appError.message}</p>
            {appError.retry && (
              <button
                onClick={() => {
                  toast.dismiss();
                  appError.retry?.();
                }}
                className="text-xs underline mt-2"
              >
                Retry
              </button>
            )}
          </div>,
          {
            duration: 8000,
            style: {
              background: '#7F1D1D',
              color: '#FEE2E2',
            },
          }
        );
        break;
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production' && 
        process.env.NEXT_PUBLIC_ENABLE_ERROR_MONITORING === 'true') {
      this.sendToMonitoring(appError);
    }
  }

  private logError(error: AppError) {
    // Add to error log
    this.errorLog.unshift({
      ...error,
      timestamp: new Date(),
    } as any);

    // Trim log if too large
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`[${error.severity?.toUpperCase() || 'ERROR'}] ${error.message}`);
      console.error('Error:', error);
      if (error.details) {
        console.log('Details:', error.details);
      }
      if (error.stack) {
        console.log('Stack:', error.stack);
      }
      console.groupEnd();
    }
  }

  private sendToMonitoring(error: AppError) {
    // This would send to Sentry, LogRocket, etc.
    // For now, just log it
    console.log('Would send to monitoring:', error);
  }

  // API error handler
  handleApiError(response: Response, context?: string) {
    let message = 'An unexpected error occurred';
    let severity: ErrorSeverity = 'error';

    if (response.status === 401) {
      message = 'You need to sign in to access this feature';
      severity = 'warning';
    } else if (response.status === 403) {
      message = 'You don\'t have permission to perform this action';
      severity = 'warning';
    } else if (response.status === 404) {
      message = 'The requested resource was not found';
      severity = 'warning';
    } else if (response.status === 429) {
      message = 'Too many requests. Please slow down.';
      severity = 'warning';
    } else if (response.status >= 500) {
      message = 'Server error. Please try again later.';
      severity = 'critical';
    }

    const error = new Error(message) as AppError;
    error.code = response.status.toString();
    error.severity = severity;
    error.details = { context, url: response.url, status: response.status };

    this.handle(error, severity);
    return error;
  }

  // Form validation error handler
  handleValidationError(errors: Record<string, string | string[]>) {
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => {
        const msgs = Array.isArray(messages) ? messages : [messages];
        return `${field}: ${msgs.join(', ')}`;
      })
      .join('\n');

    toast.error(
      <div>
        <strong>Validation Error</strong>
        <p className="text-sm mt-1 whitespace-pre-line">{errorMessages}</p>
      </div>,
      {
        duration: 6000,
      }
    );
  }

  // Success notification
  success(message: string, duration = 3000) {
    toast.success(message, { duration });
  }

  // Info notification
  info(message: string, duration = 3000) {
    toast(message, {
      icon: 'ℹ️',
      duration,
    });
  }

  // Warning notification
  warning(message: string, duration = 4000) {
    toast(message, {
      icon: '⚠️',
      duration,
      style: {
        background: '#FEF3C7',
        color: '#92400E',
      },
    });
  }

  // Get error log for debugging
  getErrorLog() {
    return [...this.errorLog];
  }

  // Clear error log
  clearErrorLog() {
    this.errorLog = [];
  }

  // Cleanup
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
      window.removeEventListener('error', this.handleGlobalError);
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Helper functions for common error scenarios
export function handleAsyncError<T>(
  promise: Promise<T>,
  context?: string
): Promise<T | null> {
  return promise.catch((error) => {
    errorHandler.handle(error, 'error', { context });
    return null;
  });
}

export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  context?: string
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return handleAsyncError(result, context);
      }
      return result;
    } catch (error) {
      errorHandler.handle(error as Error, 'error', { context });
      return null;
    }
  }) as T;
}