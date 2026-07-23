import { Injectable } from '@nestjs/common';

import { appDataSource } from '@infrastructure/db/data-source';

import type { DataSource, EntityManager } from 'typeorm';




@Injectable()
export class DatabaseService {
  private readonly db: DataSource = appDataSource;

  /**
   * Возвращает экземпляр TypeORM DataSource
   * @returns инициализированный или готовый к init DataSource
   */
  public getDataSource = (): DataSource => {
    return this.db;
  };

  /**
   * Возвращает entity manager после init
   * @returns EntityManager
   */
  public getManager = (): EntityManager => {
    if (!this.db.isInitialized) {
      throw new Error('Database connection is not initialized. Please call init() first.');
    }
    return this.db.createEntityManager();
  };

  /**
   * Инициализирует подключение к БД
   * @returns Promise завершения init
   */
  public init = async (): Promise<void> => {
    if (this.db.isInitialized) {
      return;
    }
    await this.db.initialize();
  };

  /**
   * Закрывает соединение
   * @returns Promise завершения destroy
   */
  public destroy = async (): Promise<void> => {
    if (!this.db.isInitialized) {
      return;
    }
    await this.db.destroy();
  };
}
