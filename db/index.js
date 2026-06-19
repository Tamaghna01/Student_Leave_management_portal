import { Pool } from 'pg';

let pool;

if (!process.env.DATABASE_URL) {
  console.warn("⚠️ WARNING: DATABASE_URL environment variable is not defined! Database queries will fail.");
}

if (!global.pgPool) {
  global.pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for NeonDB serverless connections
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}
pool = global.pgPool;

export default pool;
