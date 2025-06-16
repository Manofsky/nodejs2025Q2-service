import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  VERBOSE = 4,
}

@Injectable()
export class LoggingService {
  private readonly logDir = path.join(process.cwd(), 'logs');
  private readonly logFile = path.join(this.logDir, 'app.log');
  private readonly errorLogFile = path.join(this.logDir, 'error.log');
  private readonly maxFileSize: number;
  private readonly logLevel: LogLevel;

  constructor() {
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // Get log level from environment variable or default to INFO
    const envLogLevel = process.env.LOG_LEVEL || 'INFO';
    this.logLevel = this.getLogLevelFromString(envLogLevel);

    // Get max file size from environment variable or default to 10MB
    this.maxFileSize = parseInt(
      process.env.MAX_LOG_FILE_SIZE || '10485760',
      10,
    );

    // Setup global error handlers
    this.setupUncaughtExceptionHandler();
    this.setupUnhandledRejectionHandler();
  }

  private getLogLevelFromString(level: string): LogLevel {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return LogLevel.ERROR;
      case 'WARN':
        return LogLevel.WARN;
      case 'INFO':
        return LogLevel.INFO;
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'VERBOSE':
        return LogLevel.VERBOSE;
      default:
        return LogLevel.INFO;
    }
  }

  private setupUncaughtExceptionHandler() {
    process.on('uncaughtException', (error) => {
      this.error('Uncaught Exception', error);
      // Give the logger time to write to file before exiting
      setTimeout(() => process.exit(1), 1000);
    });
  }

  private setupUnhandledRejectionHandler() {
    process.on('unhandledRejection', (reason) => {
      this.error('Unhandled Rejection', reason);
    });
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${timestamp}] [${level}] ${message}`;

    if (meta) {
      if (meta instanceof Error) {
        formattedMessage += `\n${meta.stack || meta.message}`;
      } else {
        formattedMessage += `\n${util.inspect(meta, { depth: null, colors: false })}`;
      }
    }

    return formattedMessage + '\n';
  }

  private async writeToLog(filePath: string, message: string): Promise<void> {
    try {
      // Check file size and rotate if necessary
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size >= this.maxFileSize) {
          this.rotateLogFile(filePath);
        }
      }

      // Append to log file
      fs.appendFileSync(filePath, message);

      // Also log to console
      console.log(message.trim());
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  private rotateLogFile(filePath: string): void {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, '-')
      .replace(/\./g, '-');
    const newPath = path.join(dir, `${base}.${timestamp}${ext}`);

    fs.renameSync(filePath, newPath);
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage('ERROR', message, meta);
      this.writeToLog(this.logFile, formattedMessage);
      this.writeToLog(this.errorLogFile, formattedMessage);
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.writeToLog(this.logFile, this.formatMessage('WARN', message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.writeToLog(this.logFile, this.formatMessage('INFO', message, meta));
    }
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.writeToLog(this.logFile, this.formatMessage('DEBUG', message, meta));
    }
  }

  verbose(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.VERBOSE)) {
      this.writeToLog(
        this.logFile,
        this.formatMessage('VERBOSE', message, meta),
      );
    }
  }

  // Method for logging HTTP requests
  logRequest(req: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const { method, originalUrl, query, body } = req;
      this.info(`Request ${method} ${originalUrl}`, { query, body });
    }
  }

  // Method for logging HTTP responses
  logResponse(req: any, res: any, time: number): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const { method, originalUrl } = req;
      const { statusCode } = res;
      this.info(`Response ${method} ${originalUrl} ${statusCode} - ${time}ms`);
    }
  }
}
