const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool using the NeonDB connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for NeonDB serverless connections
  },
  max: 10,                  // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return error after 10 seconds if no connection
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to NeonDB:', err.message);
    return;
  }
  console.log('✅ Connected to NeonDB PostgreSQL successfully');
  release();
});

module.exports = pool;
