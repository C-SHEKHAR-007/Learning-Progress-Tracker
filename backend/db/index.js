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
    Database.instance = this;
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
    });

    this.pool.on("connect", () => {
      this.isConnected = true;
      console.log("📦 Connected to PostgreSQL database");
    });

    this.pool.on("error", (err) => {
      this.isConnected = false;
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
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
};
