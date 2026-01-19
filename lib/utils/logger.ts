/**
 * Logger utilitaire pour les APIs Next.js
 * Structure les logs pour la production (Vercel, CloudWatch, etc.)
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  requestId?: string;
  userId?: string;
  endpoint?: string;
  duration?: number;
  [key: string]: any;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('info', message, context);
    console.log(formatted);
  }

  warn(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('warn', message, context);
    console.warn(formatted);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        name: error.name,
      } : error,
    };
    const formatted = this.formatMessage('error', message, errorContext);
    console.error(formatted);
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const formatted = this.formatMessage('debug', message, context);
      console.debug(formatted);
    }
  }

  /**
   * Log une requête API avec timing
   */
  logRequest(endpoint: string, method: string, requestId: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${endpoint}`, {
      requestId,
      method,
      endpoint,
      ...context,
    });
  }

  /**
   * Log une réponse API avec timing
   */
  logResponse(
    endpoint: string,
    method: string,
    requestId: string,
    status: number,
    duration: number,
    context?: LogContext
  ): void {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    this[level](`API Response: ${method} ${endpoint} ${status}`, {
      requestId,
      method,
      endpoint,
      status,
      durationMs: duration,
      ...context,
    });
  }
}

export const logger = new Logger();
