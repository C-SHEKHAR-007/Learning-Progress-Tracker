const { Pool } = require("pg");

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

    // Register graceful shutdown handlers
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
      console.log(`\n📦 Received ${signal}, closing database connections...`);
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

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Pool configuration
      max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT, 10) || 5000,
      // Query timeout (30 seconds default)
      statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT, 10) || 30000,
    });

    this.pool.on("connect", () => {
      this.isConnected = true;
      console.log("📦 Connected to PostgreSQL database");
    });

    this.pool.on("error", (err) => {
      this.isConnected = false;
      console.error("Unexpected error on idle client", err);
      // Don't exit immediately - let the app handle reconnection
      if (!this.isShuttingDown) {
        console.error("Database connection lost, attempting to reconnect...");
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
    // Debug logging in development
    if (process.env.NODE_ENV === "development" && process.env.DEBUG_SQL === "true") {
      console.log("📝 SQL:", text);
      if (params?.length) console.log("   Params:", params);
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
      console.error("Database ping failed:", error.message);
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
   * Each query can use results from previous queries
   * @param {Function} callback - Async function receiving client
   * @returns {Promise} Result of callback
   *
   * @example
   * const result = await pool.transaction(async (client) => {
   *   const user = await client.query('SELECT * FROM users WHERE id = $1', [1]);
   *   const orders = await client.query('SELECT * FROM orders WHERE user_id = $1', [user.rows[0].id]);
   *   return { user: user.rows[0], orders: orders.rows };
   * });
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
      console.log("📦 Database connection pool closed");
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
