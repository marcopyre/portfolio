export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (level < this.level) return;

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const prefix = `[${timestamp}] [${levelName}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, data ? JSON.stringify(data) : "");
        break;
      case LogLevel.INFO:
        console.info(prefix, message, data ? JSON.stringify(data) : "");
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, data ? JSON.stringify(data) : "");
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, data ? JSON.stringify(data) : "");
        break;
    }
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any) {
    this.log(LogLevel.ERROR, message, data);
  }
}

export const logger = new Logger(
  process.env.NODE_ENV === "development" ? LogLevel.DEBUG : LogLevel.INFO
);