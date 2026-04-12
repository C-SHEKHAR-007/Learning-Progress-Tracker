/**
 * Database configuration
 */
module.exports = {
  connectionString: process.env.DATABASE_URL,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
    min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT, 10) || 5000,
    statementTimeout: parseInt(process.env.DB_STATEMENT_TIMEOUT, 10) || 30000,
  },
  debug: process.env.DEBUG_SQL === "true",
};
