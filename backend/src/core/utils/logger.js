/**
 * Simple logger utility
 * Can be replaced with Pino or Winston for production
 */

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS.info;
const isDev = process.env.NODE_ENV === "development";

/**
 * Format log message with timestamp
 */
const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
};

/**
 * Log at specified level
 */
const log = (level, message, meta = {}) => {
  if (LOG_LEVELS[level] > currentLevel) return;

  const formatted = formatMessage(level, message, meta);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "debug":
      if (isDev) console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }
};

const logger = {
  error: (message, meta) => log("error", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  info: (message, meta) => log("info", message, meta),
  debug: (message, meta) => log("debug", message, meta),
};

module.exports = logger;
