import { Test } from '@nestjs/testing';

import { DatabaseService } from '@infrastructure/db/database-service';
import { ClientEntity } from '@infrastructure/db/entities/client.entity';
import { ItemCategoryEntity } from '@infrastructure/db/entities/item-category.entity';
import { PledgeItemEntity } from '@infrastructure/db/entities/pledge-item.entity';
import { PledgeEntity } from '@infrastructure/db/entities/pledge.entity';
import { TariffEntity } from '@infrastructure/db/entities/tariff.entity';
import { seedCatalogData } from '@infrastructure/db/seeds/seed-catalog-data';

import { AppModule } from '@api/app.module';

import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';

export interface TestApplicationInterface {
  app: INestApplication;
  databaseService: DatabaseService;
  resetDatabase: () => Promise<void>;
  close: () => Promise<void>;
}

/**
 * Поднимает Nest app на sqljs для e2e
 */
export const createTestApplication = async (): Promise<TestApplicationInterface> => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>();
  app.set('query parser', 'extended');
  app.setGlobalPrefix('api/v1');
  await app.init();

  const databaseService = app.get(DatabaseService);
  await databaseService.init();
  await seedCatalogData(databaseService.getManager());

  const resetDatabase = async (): Promise<void> => {
    const dataSource = databaseService.getDataSource();
    const manager = databaseService.getManager();
    const orderedEntityMetadata = [...dataSource.entityMetadatas].reverse();

    for (const entityMetadata of orderedEntityMetadata) {
      await manager.getRepository(entityMetadata.target).clear();
    }

    await seedCatalogData(manager);
  };

  const close = async (): Promise<void> => {
    await app.close();
    await databaseService.destroy();
  };

  return {
    app,
    databaseService,
    resetDatabase,
    close,
  };
};

export const getSeedTariffs = async (databaseService: DatabaseService): Promise<TariffEntity[]> => {
  return databaseService.getManager().getRepository(TariffEntity).find({
    order: {
      id: 'ASC',
    },
  });
};

export const getSeedClients = async (databaseService: DatabaseService): Promise<ClientEntity[]> => {
  return databaseService.getManager().getRepository(ClientEntity).find({
    order: {
      id: 'ASC',
    },
  });
};

export const getSeedCategories = async (databaseService: DatabaseService): Promise<ItemCategoryEntity[]> => {
  return databaseService.getManager().getRepository(ItemCategoryEntity).find({
    order: {
      id: 'ASC',
    },
  });
};

export {
  PledgeEntity,
  PledgeItemEntity,
};
