import '@api/load-env';
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { DatabaseService } from '@infrastructure/db/database-service';
import { seedCatalogData } from '@infrastructure/db/seeds/seed-catalog-data';
import { LoggerService } from '@infrastructure/logger/logger-service';

import { AppModule } from '@api/app.module';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: process.env.WEB_ORIGIN?.split(',') ?? true,
  });

  const databaseService = app.get(DatabaseService);
  const loggerService = app.get(LoggerService);
  await databaseService.init();

  if (process.env.AUTO_SEED === 'true') {
    await seedCatalogData(databaseService.getManager());
    loggerService.info('Bootstrap', 'Catalog seed applied');
  }

  const port = Number(process.env.APP_PORT) || 3001;
  await app.listen(port);

  loggerService.info('Bootstrap', `API listening on ${port}`);
};

bootstrap().catch(error => {
  console.error(error);
  process.exit(1);
});
