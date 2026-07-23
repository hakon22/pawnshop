import { LoggerService } from '@infrastructure/logger/logger-service';

import type { Logger, QueryRunner } from 'typeorm';

/**
 * TypeORM → {@link LoggerService}
 */
export class TypeormLogger implements Logger {
  private readonly TAG = 'SQL';

  private readonly loggerService = new LoggerService();

  public log = (level: 'log' | 'info' | 'warn', message: string, queryRunner?: QueryRunner): void => {
    if (level === 'log') {
      if (queryRunner) {
        this.loggerService.debug(this.TAG, queryRunner.getMemorySql());
      }
      if (message) {
        this.loggerService.debug(this.TAG, message);
      }
    } else if (level === 'info') {
      if (queryRunner) {
        this.loggerService.info(this.TAG, queryRunner.getMemorySql());
      }
      if (message) {
        this.loggerService.info(this.TAG, message);
      }
    } else if (level === 'warn') {
      if (queryRunner) {
        this.loggerService.warn(this.TAG, queryRunner.getMemorySql());
      }
      if (message) {
        this.loggerService.warn(this.TAG, message);
      }
    }
  };

  public logMigration = (message: string, _queryRunner?: QueryRunner): void => {
    if (message) {
      this.loggerService.debug(this.TAG, message);
    }
  };

  public logQuery = (query: string, parameters?: unknown[], _queryRunner?: QueryRunner): void => {
    if (query) {
      this.loggerService.debug(this.TAG, query);
    }
    if (parameters && parameters.length > 0) {
      this.loggerService.debug(this.TAG, parameters);
    }
  };

  public logQueryError = (
    error: string | Error,
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner,
  ): void => {
    if (error && query) {
      this.loggerService.error(this.TAG, error, ':', query);
    }
    if (parameters && parameters.length > 0) {
      this.loggerService.error(this.TAG, parameters);
    }
  };

  public logQuerySlow = (
    time: number,
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner,
  ): void => {
    if (time) {
      this.loggerService.error(this.TAG, `SLOW QUERY: ${time}`);
    }
    if (query) {
      this.loggerService.error(this.TAG, query);
    }
    if (parameters && parameters.length > 0) {
      this.loggerService.error(this.TAG, parameters);
    }
  };

  public logSchemaBuild = (message: string, _queryRunner?: QueryRunner): void => {
    if (message) {
      this.loggerService.debug(this.TAG, message);
    }
  };
}
