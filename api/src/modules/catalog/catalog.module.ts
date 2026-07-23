import { Module } from '@nestjs/common';

import { ItemCategoryController } from '@api/modules/catalog/controllers/item-category.controller';
import { TariffController } from '@api/modules/catalog/controllers/tariff.controller';
import { ItemCategoryQueryService } from '@api/modules/catalog/services/item-category-query.service';
import { ItemCategoryService } from '@api/modules/catalog/services/item-category.service';
import { TariffQueryService } from '@api/modules/catalog/services/tariff-query.service';
import { TariffService } from '@api/modules/catalog/services/tariff.service';

@Module({
  controllers: [TariffController, ItemCategoryController],
  providers: [TariffService, TariffQueryService, ItemCategoryService, ItemCategoryQueryService],
  exports: [TariffService, ItemCategoryService, ItemCategoryQueryService],
})
export class CatalogModule {}
