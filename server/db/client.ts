// TODO: implement with pg or Drizzle ORM

const DATABASE_URL = process.env.DATABASE_URL;

export function getDb() {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  // TODO: create and return pool/client
  // import { Pool } from 'pg';
  // return new Pool({ connectionString: DATABASE_URL });

  return null;
}
