import type { EntityManager } from 'typeorm';

/**
 * Опции с возможностью прокинуть EntityManager (транзакция / внешний scope)
 */
export interface ManagerOptionsInterface {
  manager?: EntityManager;
}
