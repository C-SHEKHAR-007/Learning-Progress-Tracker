const { Pool } = require("pg");
const config = require("../../config");
const logger = require("../utils/logger");

/**
 * Database Connection Singleton
 * Ensures only one connection pool instance exists throughout the application
 */
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.pool = null;
    this.isConnected = false;
    this.isShuttingDown = false;
    Database.instance = this;

    this._registerShutdownHandlers();
  }

  /**
   * Register process handlers for graceful shutdown
   * @private
   */
  _registerShutdownHandlers() {
    const shutdown = async (signal) => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      logger.info(`Received ${signal}, closing database connections...`);
      await this.close();
      process.exit(0);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  }

  /**
   * Initialize the connection pool
   * @returns {Pool} PostgreSQL connection pool
   */
  connect() {
    if (this.pool) {
      return this.pool;
    }

    const dbConfig = config.database;

    this.pool = new Pool({
      connectionString: dbConfig.connectionString,
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      idleTimeoutMillis: dbConfig.pool.idleTimeoutMillis,
      connectionTimeoutMillis: dbConfig.pool.connectionTimeoutMillis,
      statement_timeout: dbConfig.pool.statementTimeout,
    });

    this.pool.on("connect", () => {
      this.isConnected = true;
      logger.info("Connected to PostgreSQL database");
    });

    this.pool.on("error", (err) => {
      this.isConnected = false;
      logger.error("Unexpected database error", { error: err.message });
      if (!this.isShuttingDown) {
        logger.warn("Database connection lost, attempting to reconnect...");
      }
    });

    return this.pool;
  }

  /**
   * Get the connection pool instance
   * @returns {Pool} PostgreSQL connection pool
   */
  getPool() {
    if (!this.pool) {
      return this.connect();
    }
    return this.pool;
  }

  /**
   * Execute a query using the pool
   * @param {string} text - SQL query string
   * @param {Array} params - Query parameters
   * @returns {Promise} Query result
   */
  query(text, params) {
    if (config.database.debug) {
      logger.debug("SQL Query", { query: text, params });
    }
    return this.getPool().query(text, params);
  }

  /**
   * Get a client from the pool for transactions
   * @returns {Promise} Pool client
   */
  getClient() {
    return this.getPool().connect();
  }

  /**
   * Health check - verify database connectivity
   * @returns {Promise<boolean>} True if database is reachable
   */
  async ping() {
    try {
      await this.query("SELECT 1");
      return true;
    } catch (error) {
      logger.error("Database ping failed", { error: error.message });
      return false;
    }
  }

  /**
   * Get pool statistics
   * @returns {Object} Pool stats (total, idle, waiting connections)
   */
  getStats() {
    const pool = this.getPool();
    return {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
      isConnected: this.isConnected,
    };
  }

  /**
   * Execute multiple queries within a transaction
   * @param {Function} callback - Async function receiving client
   * @returns {Promise} Result of callback
   */
  async transaction(callback) {
    const client = await this.getClient();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Close all connections in the pool
   * @returns {Promise}
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      logger.info("Database connection pool closed");
    }
  }

  /**
   * Check if database is connected
   * @returns {boolean}
   */
  isPoolConnected() {
    return this.isConnected && this.pool !== null;
  }
}

// Create singleton instance
const database = new Database();

// Export pool-compatible interface for backward compatibility
module.exports = {
  query: (text, params) => database.query(text, params),
  connect: () => database.getClient(),
  transaction: (callback) => database.transaction(callback),
  getPool: () => database.getPool(),
  close: () => database.close(),
  isConnected: () => database.isPoolConnected(),
  ping: () => database.ping(),
  getStats: () => database.getStats(),
};
