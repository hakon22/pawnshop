import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { isEmpty, isNil } from 'lodash-es';

import { BaseService } from '@infrastructure/base/base.service';

import { ItemCategoryQueryService } from '@api/modules/catalog/services/item-category-query.service';

import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@shared/dto/common/pagination.dto';

import type { ItemCategoryEntity } from '@infrastructure/db/entities/item-category.entity';
import type { ManagerOptionsInterface } from '@infrastructure/db/interfaces/manager-options.interface';
import type { ItemCategoryFindInterface } from '@shared/dto/catalog/item-category-find.dto';
import type { ItemCategoryQueryInterface } from '@shared/dto/catalog/item-category-query.dto';
import type { PaginatedResultInterface } from '@shared/dto/common/paginated-result.dto';

/** {@link ItemCategoryService.findMany} */
export interface FindManyOptionsInterface extends ManagerOptionsInterface, ItemCategoryQueryInterface {}

/** {@link ItemCategoryService.findOne} / {@link ItemCategoryService.findFlat} */
export type FindOneOptionsInterface = ManagerOptionsInterface;

@Injectable()
export class ItemCategoryService extends BaseService {
  @Inject(ItemCategoryQueryService)
  private readonly itemCategoryQueryService: ItemCategoryQueryService;

  private readonly TAG = 'ItemCategoryService';

  /**
   * Категория по id (со схемой характеристик)
   * @param id - идентификатор категории
   * @param options - опциональный manager ({@link FindOneOptionsInterface})
   * @returns entity категории с characteristicFields ({@link ItemCategoryEntity})
   */
  public findOne = async (id: number, options?: FindOneOptionsInterface): Promise<ItemCategoryEntity> => {
    const manager = options?.manager || this.databaseService.getManager();
    const row = await this.itemCategoryQueryService
      .createDetailQueryBuilder({ manager })
      .where('category.id = :id', { id })
      .orderBy('field.sortOrder', 'ASC')
      .getOne();

    if (isNil(row)) {
      throw new NotFoundException('Категория не найдена');
    }

    this.loggerService.debug(this.TAG, 'findOne', {
      id,
    });

    return row;
  };

  /**
   * Список групп товаров
   * @param options - пагинация и опциональный manager ({@link FindManyOptionsInterface})
   * @returns страница категорий ({@link PaginatedResultInterface} с {@link ItemCategoryFindInterface})
   */
  public findMany = async (options?: FindManyOptionsInterface): Promise<PaginatedResultInterface<ItemCategoryFindInterface>> => {
    const manager = options?.manager || this.databaseService.getManager();
    const limit = options?.limit || DEFAULT_LIMIT;
    const offset = options?.offset ?? DEFAULT_OFFSET;

    const idsBuilder = this.itemCategoryQueryService.createSelectQueryBuilder({ manager });
    this.itemCategoryQueryService.applyDefaultSorting(idsBuilder);
    const [count, idRows] = await Promise.all([
      idsBuilder.getCount(),
      idsBuilder
        .clone()
        .select('category.id', 'id')
        .take(limit)
        .skip(offset)
        .getRawMany<{ id: string | number; }>(),
    ]);

    const ids = idRows.map(({ id }) => Number(id));
    if (isEmpty(ids)) {
      return {
        items: [],
        count,
        limit,
        offset,
      };
    }

    const detailBuilder = this.itemCategoryQueryService.createDetailQueryBuilder({ manager });
    this.itemCategoryQueryService.applyDefaultSorting(detailBuilder);

    const items = await detailBuilder
      .where('category.id IN (:...ids)', { ids })
      .getMany();

    this.loggerService.debug(this.TAG, 'findMany', {
      count,
      limit,
      offset,
    });

    return {
      items,
      count,
      limit,
      offset,
    };
  };

  /**
   * Все категории без пагинации
   * @param options - опциональный manager ({@link FindOneOptionsInterface})
   * @returns список категорий с characteristicFields
   */
  public findFlat = async (options?: FindOneOptionsInterface): Promise<ItemCategoryEntity[]> => {
    const manager = options?.manager || this.databaseService.getManager();
    const builder = this.itemCategoryQueryService.createDetailQueryBuilder({ manager });

    this.itemCategoryQueryService.applyDefaultSorting(builder);

    const items = await builder.getMany();

    this.loggerService.debug(this.TAG, 'findFlat', {
      count: items.length,
    });

    return items;
  };
}
