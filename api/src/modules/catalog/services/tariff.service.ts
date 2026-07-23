import { Inject, Injectable } from '@nestjs/common';

import { BaseService } from '@infrastructure/base/base.service';

import { TariffQueryService } from '@api/modules/catalog/services/tariff-query.service';

import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@shared/dto/common/pagination.dto';

import type { TariffEntity } from '@infrastructure/db/entities/tariff.entity';
import type { ManagerOptionsInterface } from '@infrastructure/db/interfaces/manager-options.interface';
import type { TariffFindInterface } from '@shared/dto/catalog/tariff-find.dto';
import type { TariffQueryInterface } from '@shared/dto/catalog/tariff-query.dto';
import type { PaginatedResultInterface } from '@shared/dto/common/paginated-result.dto';

/** {@link TariffService.findMany} */
export interface FindManyOptionsInterface extends ManagerOptionsInterface, TariffQueryInterface {}

/** {@link TariffService.findFlat} */
export type FindFlatOptionsInterface = ManagerOptionsInterface;

@Injectable()
export class TariffService extends BaseService {
  @Inject(TariffQueryService)
  private readonly tariffQueryService: TariffQueryService;

  private readonly TAG = 'TariffService';

  /**
   * Список тарифов
   * @param options - пагинация и опциональный manager ({@link FindManyOptionsInterface})
   * @returns страница тарифов ({@link PaginatedResultInterface} с {@link TariffFindInterface})
   */
  public findMany = async (options?: FindManyOptionsInterface): Promise<PaginatedResultInterface<TariffFindInterface>> => {
    const manager = options?.manager || this.databaseService.getManager();
    const limit = options?.limit || DEFAULT_LIMIT;
    const offset = options?.offset ?? DEFAULT_OFFSET;
    const builder = this.tariffQueryService.createSelectQueryBuilder({ manager });
    this.tariffQueryService.applyDefaultSorting(builder);
    builder
      .take(limit)
      .skip(offset);

    const [items, count] = await builder.getManyAndCount();
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
   * Все тарифы без пагинации
   * @param options - опциональный manager ({@link FindFlatOptionsInterface})
   * @returns список тарифов
   */
  public findFlat = async (options?: FindFlatOptionsInterface): Promise<TariffEntity[]> => {
    const manager = options?.manager || this.databaseService.getManager();
    const builder = this.tariffQueryService.createSelectQueryBuilder({ manager });
    this.tariffQueryService.applyDefaultSorting(builder);
    const items = await builder.getMany();

    this.loggerService.debug(this.TAG, 'findFlat', {
      count: items.length,
    });

    return items;
  };
}
