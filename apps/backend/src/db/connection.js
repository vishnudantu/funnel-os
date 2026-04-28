/**
 * Knex database connection
 * Singleton instance for database access
 */

import knex from 'knex';
import * as knexConfig from './knexfile.js';

const env = process.env.NODE_ENV || 'development';

const db = knex(knexConfig[env]);

export default db;
