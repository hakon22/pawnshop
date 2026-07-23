import { Injectable } from '@nestjs/common';
import { isEmpty, isNil } from 'lodash-es';
import { Brackets, type SelectQueryBuilder } from 'typeorm';

import { BaseService } from '@infrastructure/base/base.service';
import { ClientEntity } from '@infrastructure/db/entities/client.entity';
import { isSqljsDatabase } from '@infrastructure/db/helpers/is-sqljs-database.helper';

import type { ManagerOptionsInterface } from '@infrastructure/db/interfaces/manager-options.interface';

/**
 * Query-слой клиентов: builders и фильтры
 */
@Injectable()
export class ClientQueryService extends BaseService {
  /**
   * Корневой builder
   * @param options - опциональный manager
   * @returns builder
   */
  public createSelectQueryBuilder = (options?: ManagerOptionsInterface): SelectQueryBuilder<ClientEntity> => {
    const manager = options?.manager || this.databaseService.getManager();
    return manager
      .getRepository(ClientEntity)
      .createQueryBuilder('client');
  };

  /**
   * Сортировка списка по ФИО
   * @param builder - query builder
   */
  public applyDefaultSorting = (builder: SelectQueryBuilder<ClientEntity>): void => {
    builder
      .orderBy('client.lastName', 'ASC')
      .addOrderBy('client.firstName', 'ASC');
  };

  /**
   * Поиск по ФИО / телефону; no-op если пусто
   * @param builder - query builder
   * @param search - строка поиска
   */
  public applySearchFilter = (builder: SelectQueryBuilder<ClientEntity>, search?: string): void => {
    if (isNil(search) || isEmpty(search.trim())) {
      return;
    }

    const isSqljs = isSqljsDatabase();

    builder
      .andWhere(new Brackets(qb => {
        if (isSqljs) {
          qb.where('LOWER(client.lastName) LIKE LOWER(:pattern)')
            .orWhere('LOWER(client.firstName) LIKE LOWER(:pattern)')
            .orWhere('LOWER(COALESCE(client.middleName, \'\')) LIKE LOWER(:pattern)')
            .orWhere('LOWER(client.phone) LIKE LOWER(:pattern)');
          return;
        }

        qb.where('client.lastName ILIKE :pattern')
          .orWhere('client.firstName ILIKE :pattern')
          .orWhere('COALESCE(client.middleName, \'\') ILIKE :pattern')
          .orWhere('client.phone ILIKE :pattern');
      }))
      .setParameter('pattern', `%${search.trim()}%`);
  };
}
