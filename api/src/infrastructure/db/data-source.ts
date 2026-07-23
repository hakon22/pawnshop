import '@api/load-env';
import 'reflect-metadata';

import path from 'path';
import { fileURLToPath } from 'url';

import pg from 'pg';
import { DataSource, type DataSourceOptions } from 'typeorm';

import { entities } from '@infrastructure/db/entities/index';
import { isSqljsDatabase } from '@infrastructure/db/helpers/is-sqljs-database.helper';
import { TypeormLogger } from '@infrastructure/db/typeorm-logger';

/**
 * node-pg по умолчанию отдаёт int8 (bigint) строкой
 */
pg.types.setTypeParser(pg.types.builtins.INT8, (value: string): number => {
  return Number(value);
});

const dir = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const migrationsGlob = path.join(dir, 'migrations', `*.${isProduction ? 'js' : 'ts'}`);

/**
 * В контейнере `localhost` — сам контейнер, а не хост с Postgres.
 * `docker-compose.dev.yml` задаёт `host.docker.internal` через `extra_hosts`.
 * Prod (`network_mode: host`) IS_DOCKER не ставит — localhost остаётся хостом.
 */
const resolveDatabaseHost = (): string => {
  const host = process.env.DB_HOST?.trim() || 'localhost';
  if (process.env.IS_DOCKER === 'TRUE' && (host === 'localhost' || host === '127.0.0.1')) {
    return 'host.docker.internal';
  }
  return host;
};

export const getDataSourceOptions = (): DataSourceOptions => {
  if (isSqljsDatabase()) {
    return {
      type: 'sqljs',
      autoSave: false,
      location: undefined,
      synchronize: true,
      logging: true,
      logger: new TypeormLogger(),
      entities,
    };
  }

  return {
    type: 'postgres',
    host: resolveDatabaseHost(),
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'pawnshop_test',
    synchronize: false,
    logging: true,
    logger: new TypeormLogger(),
    entities,
    migrations: [migrationsGlob],
  };
};

export const appDataSource = new DataSource(getDataSourceOptions());
