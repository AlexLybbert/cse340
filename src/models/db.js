import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const isLocalConnection = !connectionString
  || connectionString.includes('localhost')
  || connectionString.includes('127.0.0.1');
const useSsl = process.env.PGSSLMODE === 'require' || !isLocalConnection;

const db = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false
});

const testConnection = async () => {
  await db.query('SELECT 1');
};

export { testConnection };
export default db;
