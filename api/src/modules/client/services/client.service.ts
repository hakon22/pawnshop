import { Inject, Injectable } from '@nestjs/common';
import { isEmpty, isNil } from 'lodash-es';

import { BaseService } from '@infrastructure/base/base.service';
import { ClientEntity } from '@infrastructure/db/entities/client.entity';

import { ClientQueryService } from '@api/modules/client/services/client-query.service';

import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@shared/dto/common/pagination.dto';

import type { ManagerOptionsInterface } from '@infrastructure/db/interfaces/manager-options.interface';
import type { ClientFindInterface } from '@shared/dto/client/client-find.dto';
import type { ClientFormInterface } from '@shared/dto/client/client-form.dto';
import type { ClientQueryInterface } from '@shared/dto/client/client-query.dto';
import type { PaginatedResultInterface } from '@shared/dto/common/paginated-result.dto';

/** {@link ClientService.findMany} */
export interface FindManyOptionsInterface extends ManagerOptionsInterface, ClientQueryInterface {}

/** {@link ClientService.createOne} */
export interface CreateOneParamsInterface extends ClientFormInterface, ManagerOptionsInterface {}

@Injectable()
export class ClientService extends BaseService {
  @Inject(ClientQueryService)
  private readonly clientQueryService: ClientQueryService;

  private readonly TAG = 'ClientService';

  /**
   * Поиск клиентов по ФИО / телефону
   * @param options - поиск, пагинация и опциональный manager ({@link FindManyOptionsInterface})
   * @returns страница клиентов ({@link PaginatedResultInterface} с {@link ClientFindInterface})
   */
  public findMany = async (options?: FindManyOptionsInterface): Promise<PaginatedResultInterface<ClientFindInterface>> => {
    const manager = options?.manager || this.databaseService.getManager();
    const limit = options?.limit || DEFAULT_LIMIT;
    const offset = options?.offset ?? DEFAULT_OFFSET;
    const builder = this.clientQueryService.createSelectQueryBuilder({ manager });
    this.clientQueryService.applySearchFilter(builder, options?.search);
    this.clientQueryService.applyDefaultSorting(builder);
    builder
      .take(limit)
      .skip(offset);

    const [items, count] = await builder.getManyAndCount();
    this.loggerService.debug(this.TAG, 'findMany', {
      search: options?.search,
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
   * Создание клиента
   * @param params - данные формы и опциональный manager ({@link CreateOneParamsInterface})
   * @returns созданный клиент ({@link ClientFindInterface})
   */
  public createOne = async (params: CreateOneParamsInterface): Promise<ClientFindInterface> => {
    const manager = params.manager || this.databaseService.getManager();
    const repository = manager.getRepository(ClientEntity);
    const middleName = isNil(params.middleName) || isEmpty(params.middleName.trim())
      ? null
      : params.middleName.trim();
    const entity = repository.create({
      lastName: params.lastName,
      firstName: params.firstName,
      middleName,
      phone: params.phone,
    });
    const saved = await repository.save(entity);
    this.loggerService.info(this.TAG, 'createOne', {
      id: saved.id,
    });

    return saved;
  };
}
