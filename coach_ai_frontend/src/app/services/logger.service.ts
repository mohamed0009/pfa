import { Injectable } from '@angular/core';

/**
 * Logger service to replace console.log/error/warn
 * Provides centralized logging with environment-aware behavior
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  // In production, set this to true to disable debug/info logs
  private isProduction = false; // Set via environment or build config

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, ...args: any[]): void {
    if (!this.isProduction) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log info messages
   */
  info(message: string, ...args: any[]): void {
    if (!this.isProduction) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  /**
   * Log error messages
   */
  error(message: string, error?: any, ...args: any[]): void {
    if (error) {
      console.error(`[ERROR] ${message}`, error, ...args);
    } else {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  /**
   * Log messages (alias for info in development, silent in production)
   */
  log(message: string, ...args: any[]): void {
    if (!this.isProduction) {
      console.log(`[LOG] ${message}`, ...args);
    }
  }
}

