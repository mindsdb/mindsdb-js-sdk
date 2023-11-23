interface ILogger {
  log?: (message: any) => void;
  info?: (message: any) => void;
  error: (message: any) => void;
  warn: (message: any) => void;
  debug: (message: any) => void;
  trace?: (message: any) => void;
  verbose?: (message: any) => void;
}

enum LogLevel {
  LOG = 'log',
  INFO = 'info',
  ERROR = 'error',
  WARN = 'warn',
  DEBUG = 'debug',
  TRACE = 'trace',
  VERBOSE = 'verbose',
}

class Logger implements ILogger {
  private logLevels: { [key in LogLevel]: number } = {
    [LogLevel.TRACE]: 0,
    [LogLevel.DEBUG]: 1,
    [LogLevel.VERBOSE]: 1, // or LogLevel.DEBUG, they are at the same level
    [LogLevel.INFO]: 2, // or LogLevel.LOG, they are at the same level
    [LogLevel.LOG]: 2,  // or LogLevel.INFO
    [LogLevel.WARN]: 3,
    [LogLevel.ERROR]: 4,
  };

  constructor(
    private readonly logger: ILogger,
    private readonly logLevel: LogLevel
  ) {
    this.log = this.logger.log ? this.logWithLevel(LogLevel.LOG) : this.logger.info ? this.logWithLevel(LogLevel.INFO) : () => { return; };
    this.info = this.logger.info ? this.logWithLevel(LogLevel.INFO) : this.logger.log ? this.logWithLevel(LogLevel.LOG) : () => { return; };
    this.error = this.logWithLevel(LogLevel.ERROR);
    this.warn = this.logWithLevel(LogLevel.WARN);
    this.debug = this.logWithLevel(LogLevel.DEBUG);
    this.trace = this.logger.trace ? this.logWithLevel(LogLevel.TRACE) : this.logger.verbose ? this.logWithLevel(LogLevel.VERBOSE) : () => { return; };
    this.verbose = this.logger.verbose ? this.logWithLevel(LogLevel.VERBOSE) : this.logger.trace ? this.logWithLevel(LogLevel.TRACE) : () => { return; }
  }

  log: (message: any) => void;
  info: (message: any) => void;
  error: (message: any) => void;
  warn: (message: any) => void;
  debug: (message: any) => void;
  trace: (message: any) => void;
  verbose: ((message: any) => void);

  private logWithLevel(level: LogLevel): (message: any) => void {
    return (message: any) => {
      if (this.logLevels[level] >= this.logLevels[this.logLevel]) {
        this.logger[level]?.(message);
      }
    };
  }
}

export { ILogger, Logger, LogLevel };
