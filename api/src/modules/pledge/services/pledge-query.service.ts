import { Injectable } from '@nestjs/common';
import { isNil } from 'lodash-es';

import { BaseService } from '@infrastructure/base/base.service';
import { PledgeEntity } from '@infrastructure/db/entities/pledge.entity';

import { PledgeStatusEnum } from '@shared/dto/pledge/enums/pledge-status.enum';

import type { ManagerOptionsInterface } from '@infrastructure/db/interfaces/manager-options.interface';
import type { ActivePledgesFilterInterface } from '@shared/dto/pledge/active-pledges-filter.dto';
import type { SelectQueryBuilder } from 'typeorm';

/**
 * Query-слой залогов: builders и фильтры
 */
@Injectable()
export class PledgeQueryService extends BaseService {
  /**
   * Корневой builder
   * @param options - опциональный manager
   * @returns builder
   */
  public createSelectQueryBuilder = (options?: ManagerOptionsInterface): SelectQueryBuilder<PledgeEntity> => {
    const manager = options?.manager || this.databaseService.getManager();
    return manager.getRepository(PledgeEntity).createQueryBuilder('pledge');
  };

  /**
   * Builder со связями для Find DTO / деталей
   * @param options - опциональный manager
   * @returns builder с joins
   */
  public createDetailQueryBuilder = (options?: ManagerOptionsInterface): SelectQueryBuilder<PledgeEntity> => {
    return this.createSelectQueryBuilder(options)
      .leftJoinAndSelect('pledge.items', 'items')
      .leftJoinAndSelect('items.category', 'category')
      .leftJoinAndSelect('category.characteristicFields', 'categoryFields')
      .leftJoinAndSelect('items.characteristicValues', 'characteristicValues')
      .leftJoinAndSelect('characteristicValues.field', 'field')
      .leftJoinAndSelect('pledge.tariff', 'tariff')
      .leftJoinAndSelect('pledge.client', 'client');
  };

  /**
   * Фильтры list/flat (активные + clientId из {@link ActivePledgesFilterInterface})
   * @param builder - query builder
   * @param filters - поля фильтра
   */
  public applyFilters = (builder: SelectQueryBuilder<PledgeEntity>, filters?: Partial<ActivePledgesFilterInterface>): void => {
    this.applyStatusFilter(builder, PledgeStatusEnum.ACTIVE);
    this.applyClientFilter(builder, filters?.clientId);
  };

  /**
   * Фильтр по статусу; no-op если не передан
   * @param builder - query builder
   * @param status - статус
   */
  public applyStatusFilter = (builder: SelectQueryBuilder<PledgeEntity>, status?: PledgeStatusEnum): void => {
    if (isNil(status)) {
      return;
    }
    builder.andWhere('pledge.status = :status', { status });
  };

  /**
   * Фильтр по клиенту (FK); no-op если не передан
   * @param builder - query builder
   * @param clientId - идентификатор клиента (плоский query-параметр)
   */
  public applyClientFilter = (builder: SelectQueryBuilder<PledgeEntity>, clientId?: number): void => {
    if (isNil(clientId)) {
      return;
    }
    builder.andWhere('pledge.client = :clientId', { clientId });
  };
}
