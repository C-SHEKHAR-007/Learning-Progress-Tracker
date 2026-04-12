/**
 * Central configuration module
 * Merges all environment variables with defaults
 */
require("dotenv").config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 5000,

  // Database configuration
  database: require("./database"),

  // App-wide constants
  constants: require("./constants"),
};

module.exports = config;
