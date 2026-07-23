import '@api/load-env';
import 'reflect-metadata';

import { appDataSource } from '@infrastructure/db/data-source';
import { seedCatalogData } from '@infrastructure/db/seeds/seed-catalog-data';
import { LoggerService } from '@infrastructure/logger/logger-service';

const run = async (): Promise<void> => {
  const loggerService = new LoggerService();

  await appDataSource.initialize();
  await seedCatalogData(appDataSource.manager);
  await appDataSource.destroy();

  loggerService.info('Seed', 'Catalog seed applied');
};

run().catch(error => {
  console.error(error);
  process.exit(1);
});
