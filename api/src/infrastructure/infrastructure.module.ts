import { Global, Inject, Module, type OnModuleInit } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { DatabaseService } from '@infrastructure/db/database-service';
import { SqlHelpersService } from '@infrastructure/db/sql-helpers.service';
import { LoggerService } from '@infrastructure/logger/logger-service';
import { AllExceptionsFilter } from '@infrastructure/validation/all-exceptions.filter';
import { YupResponseInterceptor } from '@infrastructure/validation/yup-response.interceptor';

@Global()
@Module({
  providers: [
    LoggerService,
    DatabaseService,
    SqlHelpersService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: YupResponseInterceptor,
    },
  ],
  exports: [LoggerService, DatabaseService, SqlHelpersService],
})
export class InfrastructureModule implements OnModuleInit {
  @Inject(DatabaseService)
  private readonly databaseService: DatabaseService;

  @Inject(LoggerService)
  private readonly loggerService: LoggerService;

  private readonly TAG = 'InfrastructureModule';

  public async onModuleInit(): Promise<void> {
    await this.databaseService.init();
    this.loggerService.info(this.TAG, 'Database initialized');
  }
}
