/**
 * Prisma Seed Script
 * Seeds the database with initial data
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Create default collection if it doesn't exist
    const defaultCollection = await prisma.collection.upsert({
        where: { name: "General" },
        update: {},
        create: {
            name: "General",
            color: "#6366f1",
            icon: "folder",
            orderIndex: 0,
        },
    });

    console.log("✅ Default collection created:", defaultCollection.name);
    console.log("🌱 Seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
