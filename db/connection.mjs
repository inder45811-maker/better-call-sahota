import postgres from 'postgres';
/** @type {import('postgres').Sql | undefined} */
let client;
/** @returns {import('postgres').Sql} */
export function getSql() {
  if (!client) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error('The enquiry database is not configured.');
    const hostname = new URL(url).hostname;
    const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname);
    client = postgres(url, {
      max: 1,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: local ? false : 'require',
    });
  }
  return client;
}
