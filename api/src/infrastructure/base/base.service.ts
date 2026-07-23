import { Inject } from '@nestjs/common';

import { DatabaseService } from '@infrastructure/db/database-service';
import { SqlHelpersService } from '@infrastructure/db/sql-helpers.service';
import { LoggerService } from '@infrastructure/logger/logger-service';

/**
 * Общие зависимости для доменных сервисов
 */
export abstract class BaseService {
  @Inject(DatabaseService)
  protected readonly databaseService: DatabaseService;

  @Inject(LoggerService)
  protected readonly loggerService: LoggerService;

  @Inject(SqlHelpersService)
  protected readonly sqlHelpersService: SqlHelpersService;
}
