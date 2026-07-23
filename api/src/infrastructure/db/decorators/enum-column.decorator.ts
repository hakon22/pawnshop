import { Column } from 'typeorm';

import { isSqljsDatabase } from '@infrastructure/db/helpers/is-sqljs-database.helper';

interface EnumColumnOptionsInterface {
  enum: object;
  enumName: string;
  enumSchema?: string;
  default?: string;
  name?: string;
  length?: number;
}

/**
 * Колонка ENUM для postgres и varchar для sqljs
 */
export const EnumColumn = (options: EnumColumnOptionsInterface): PropertyDecorator => {
  if (isSqljsDatabase()) {
    return Column({
      type: 'varchar',
      length: options.length ?? 64,
      name: options.name,
      default: options.default,
    });
  }

  return Column({
    type: 'enum',
    enum: options.enum,
    enumName: options.enumSchema
      ? `${options.enumSchema}.${options.enumName}`
      : options.enumName,
    name: options.name,
    default: options.default,
  });
};
