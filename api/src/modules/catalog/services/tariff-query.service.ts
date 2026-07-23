import { Injectable } from '@nestjs/common';

import { BaseService } from '@infrastructure/base/base.service';
import { TariffEntity } from '@infrastructure/db/entities/tariff.entity';

import type { ManagerOptionsInterface } from '@infrastructure/db/interfaces/manager-options.interface';
import type { SelectQueryBuilder } from 'typeorm';

/**
 * Query-слой тарифов: builders и сортировка
 */
@Injectable()
export class TariffQueryService extends BaseService {
  /**
   * Корневой builder
   * @param options - опциональный manager
   * @returns builder
   */
  public createSelectQueryBuilder = (options?: ManagerOptionsInterface): SelectQueryBuilder<TariffEntity> => {
    const manager = options?.manager || this.databaseService.getManager();
    return manager
      .getRepository(TariffEntity)
      .createQueryBuilder('tariff');
  };

  /**
   * Сортировка по id ASC
   * @param builder - query builder
   */
  public applyDefaultSorting = (builder: SelectQueryBuilder<TariffEntity>): void => {
    builder.orderBy('tariff.id', 'ASC');
  };
}
