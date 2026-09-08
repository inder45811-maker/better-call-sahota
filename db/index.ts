import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { getSql } from './connection.mjs';
export { getSql };
export function getDb() {
  return drizzle(getSql(), { schema });
}
