import { isSqljsDatabase } from '@infrastructure/db/helpers/is-sqljs-database.helper';

interface EntityOptionsInputInterface {
  name: string;
  schema: string;
}

/**
 * Опции @Entity: schema только для postgres
 */
export const resolveEntityOptions = (options: EntityOptionsInputInterface): { name: string; schema?: string; } => {
  if (isSqljsDatabase()) {
    return {
      name: options.name,
    };
  }

  return {
    name: options.name,
    schema: options.schema,
  };
};
