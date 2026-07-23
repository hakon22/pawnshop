import { PrimaryGeneratedColumn } from 'typeorm';

import { resolveIdColumnType } from '@infrastructure/db/helpers/resolve-column-type.helper';

/**
 * Автоинкрементный id (bigint в PostgreSQL)
 */
export const BigIntPrimaryColumn = (): PropertyDecorator => {
  return PrimaryGeneratedColumn({
    type: resolveIdColumnType(),
  });
};
