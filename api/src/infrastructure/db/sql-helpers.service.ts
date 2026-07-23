import { Injectable } from '@nestjs/common';
import { QueryBuilder, type EntityManager, type ObjectLiteral } from 'typeorm';

/**
 * Хелперы для TypeORM QueryBuilder / EntityManager
 */
@Injectable()
export class SqlHelpersService {
  /**
   * Есть ли join с указанным alias
   * @param builder - query builder
   * @param alias - alias join'а
   * @returns true, если join уже есть
   */
  public hasJoin = (builder: QueryBuilder<ObjectLiteral>, alias: string): boolean => {
    if (!(builder instanceof QueryBuilder)) {
      throw new Error('Received value is not TypeORM query builder');
    }

    return (builder.expressionMap.joinAttributes || []).some(item => item.alias?.name === alias);
  };

  /**
   * Активна ли транзакция у manager
   * @param manager - entity manager
   * @returns true, если queryRunner в транзакции
   */
  public isTransactionActive = (manager: EntityManager): boolean => {
    return manager.queryRunner?.isTransactionActive === true;
  };

  /**
   * Выполнить в текущей транзакции или открыть новую
   * @param manager - entity manager
   * @param run - колбэк с transactional manager
   * @returns результат колбэка
   */
  public runInTransaction = async <T>(manager: EntityManager, run: (manager: EntityManager) => Promise<T>): Promise<T> => {
    if (this.isTransactionActive(manager)) {
      return run(manager);
    }

    return manager.transaction(run);
  };
}
