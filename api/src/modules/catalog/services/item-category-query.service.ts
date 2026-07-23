import { Injectable } from '@nestjs/common';

import { BaseService } from '@infrastructure/base/base.service';
import { ItemCategoryEntity } from '@infrastructure/db/entities/item-category.entity';

import type { ManagerOptionsInterface } from '@infrastructure/db/interfaces/manager-options.interface';
import type { SelectQueryBuilder } from 'typeorm';

/**
 * Query-слой категорий: builders и joins
 */
@Injectable()
export class ItemCategoryQueryService extends BaseService {
  /**
   * Корневой builder
   * @param options - опциональный manager
   * @returns builder
   */
  public createSelectQueryBuilder = (options?: ManagerOptionsInterface): SelectQueryBuilder<ItemCategoryEntity> => {
    const manager = options?.manager || this.databaseService.getManager();
    return manager
      .getRepository(ItemCategoryEntity)
      .createQueryBuilder('category');
  };

  /**
   * Builder со схемой характеристик
   * @param options - опциональный manager
   * @returns builder с joins
   */
  public createDetailQueryBuilder = (options?: ManagerOptionsInterface): SelectQueryBuilder<ItemCategoryEntity> => {
    return this.createSelectQueryBuilder(options)
      .leftJoinAndSelect('category.characteristicFields', 'field');
  };

  /**
   * Сортировка по id ASC (+ sortOrder полей, если join `field` уже есть)
   * @param builder - query builder
   */
  public applyDefaultSorting = (builder: SelectQueryBuilder<ItemCategoryEntity>): void => {
    builder.orderBy('category.id', 'ASC');
    if (this.sqlHelpersService.hasJoin(builder, 'field')) {
      builder.addOrderBy('field.sortOrder', 'ASC');
    }
  };
}
