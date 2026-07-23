import { Column } from 'typeorm';

import { isSqljsDatabase } from '@infrastructure/db/helpers/is-sqljs-database.helper';

interface JsonColumnOptionsInterface {
  name?: string;
  nullable?: boolean;
}

/**
 * JSONB для postgres и simple-json для sqljs
 */
export const JsonColumn = (options: JsonColumnOptionsInterface = {}): PropertyDecorator => {
  if (isSqljsDatabase()) {
    return Column({
      type: 'simple-json',
      name: options.name,
      nullable: options.nullable,
    });
  }

  return Column({
    type: 'jsonb',
    name: options.name,
    nullable: options.nullable,
  });
};
