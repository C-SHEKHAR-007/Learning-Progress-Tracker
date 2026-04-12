/**
 * Prisma Client Singleton
 * Ensures only one instance of PrismaClient is used throughout the application
 */
const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

// Prevent multiple instances in development due to hot reloading
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [
            { emit: "event", level: "query" },
            { emit: "stdout", level: "error" },
            { emit: "stdout", level: "warn" },
          ]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Log queries in development
if (process.env.NODE_ENV === "development" && process.env.DEBUG_SQL === "true") {
  prisma.$on("query", (e) => {
    logger.debug("Prisma Query", {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info("Closing Prisma connection...");
  await prisma.$disconnect();
  logger.info("Prisma connection closed");
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

module.exports = prisma;
