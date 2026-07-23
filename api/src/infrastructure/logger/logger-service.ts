import { Injectable } from '@nestjs/common';
import moment from 'moment-timezone';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggerService {
  private readonly TAG = 'LoggerService';

  private readonly logDir = '/srv/logs';

  private readonly appName = process.env.APP_NAME ?? 'pawnshop';

  private colorizer = winston.format.colorize();

  private readonly levels = {
    critical: 0,
    error: 1,
    warn: 2,
    info: 3,
    verbose: 4,
    debug: 5,
  };

  private readonly colors = {
    critical: 'red',
    error: 'brightRed',
    warn: 'brightRed',
    info: 'brightGreen',
    debug: 'grey',
    verbose: 'green',
  };

  private logger: winston.Logger;

  private transports: winston.transport[];

  constructor() {
    this.colorizer.addColors(this.colors);
    this.transports = process.env.NODE_ENV !== 'production'
      ? [new winston.transports.Console()]
      : [
        new DailyRotateFile({
          dirname: this.logDir,
          filename: `${this.appName}-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'debug',
        }),
        new DailyRotateFile({
          dirname: this.logDir,
          filename: `${this.appName}-error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',
        }),
      ];

    this.logger = winston.createLogger({
      level: 'debug',
      levels: this.levels,
      format: winston.format.combine(
        winston.format.timestamp({
          format: () => moment().tz('Europe/Moscow').format(),
        }),
        winston.format.printf(info => {
          const metadata = `${process.pid} ${info.timestamp} ${info.level}: ${info.module ? `[${info.module}]` : ''}`;
          const messageText = typeof info.message === 'object'
            ? JSON.stringify(info.message)
            : String(info.message);
          const messagePart = messageText[0] === '[' ? messageText : ` ${messageText}`;
          const stackPart = info.stack ? ` ${JSON.stringify(info.stack)}` : '';

          if (process.env.NODE_ENV === 'production') {
            return `${metadata}${messagePart}${stackPart}`;
          }

          switch (info.level) {
            case 'critical':
            case 'error':
            case 'debug':
              return this.colorizer.colorize(info.level, `${metadata}${messagePart}${stackPart}`);
            default:
              return `${this.colorizer.colorize(info.level, metadata)}${messagePart}`;
          }
        }),
      ),
      transports: this.transports,
    });
  }

  private getMeta = (context: string): { module: string; } => ({
    module: context,
  });

  private getArgs = (args: unknown[], error?: boolean): string => {
    const result: string[] = [];

    args.forEach(argument => {
      if (!argument) {
        return;
      }
      if (!(typeof argument === 'object') && !Array.isArray(argument)) {
        result.push(String(argument));
        return;
      }
      if (argument instanceof Error) {
        result.push(argument.stack ? argument.stack : String(argument));
        return;
      }
      result.push(error ? JSON.stringify(argument, null, 2) : JSON.stringify(argument));
    });

    return result.join(' ');
  };

  private log = (
    level: 'error' | 'warn' | 'info' | 'verbose' | 'debug',
    context: string,
    args: unknown[],
    error?: boolean,
  ): void => {
    const text = this.getArgs(args, error);
    this.logger.log(level, text, this.getMeta(context));
  };

  public info = (context: string, ...args: unknown[]): void => {
    this.log('info', context, args);
  };

  public debug = (context: string, ...args: unknown[]): void => {
    this.log('debug', context, args);
  };

  public warn = (context: string, ...args: unknown[]): void => {
    this.log('warn', context, args);
  };

  public error = (context: string, ...args: unknown[]): void => {
    this.log('error', context, args, true);
  };
}
