import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env.development') });

/** @type { import('knex').Knex.Config } */
export const development = {
  client: 'mariadb',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'funnelos',
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
};

/** @type { import('knex').Knex.Config } */
export const staging = {
  ...development,
  connection: {
    ...development.connection,
    host: process.env.DB_HOST || 'staging-db',
  },
};

/** @type { import('knex').Knex.Config } */
export const production = {
  ...development,
  connection: {
    ...development.connection,
    host: process.env.DB_HOST || 'prod-db',
  },
};
