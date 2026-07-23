import { isSqljsDatabase } from '@infrastructure/db/helpers/is-sqljs-database.helper';

/**
 * Текстовый тип: character varying в postgres, varchar в sqljs
 */
export const resolveStringColumnType = (): 'varchar' | 'character varying' => {
  return isSqljsDatabase() ? 'varchar' : 'character varying';
};

/**
 * Числовой тип с дробной частью
 */
export const resolveNumericColumnType = (): 'real' | 'numeric' => {
  return isSqljsDatabase() ? 'real' : 'numeric';
};

/**
 * Тип даты/времени
 */
export const resolveDateTimeColumnType = (): 'datetime' | 'timestamptz' => {
  return isSqljsDatabase() ? 'datetime' : 'timestamptz';
};

/**
 * Тип идентификатора: bigint в postgres, integer в sqljs
 */
export const resolveIdColumnType = (): 'integer' | 'bigint' => {
  return isSqljsDatabase() ? 'integer' : 'bigint';
};
