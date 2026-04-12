-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('video', 'pdf');

-- CreateTable
CREATE TABLE "collections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "icon" TEXT NOT NULL DEFAULT 'folder',
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "file_id" TEXT NOT NULL,
    "file_path" TEXT,
    "collection_id" INTEGER,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "last_position" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "file_size" BIGINT NOT NULL DEFAULT 0,
    "thumbnail" TEXT,
    "current_page" INTEGER NOT NULL DEFAULT 1,
    "total_pages" INTEGER NOT NULL DEFAULT 0,
    "bookmarks" JSONB NOT NULL DEFAULT '[]',
    "notes" JSONB NOT NULL DEFAULT '[]',
    "reading_time" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_history" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL,
    "time_spent" INTEGER NOT NULL DEFAULT 0,
    "session_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collections_name_key" ON "collections"("name");

-- CreateIndex
CREATE INDEX "collections_order_index_idx" ON "collections"("order_index");

-- CreateIndex
CREATE UNIQUE INDEX "learning_items_file_id_key" ON "learning_items"("file_id");

-- CreateIndex
CREATE INDEX "learning_items_order_index_idx" ON "learning_items"("order_index");

-- CreateIndex
CREATE INDEX "learning_items_type_idx" ON "learning_items"("type");

-- CreateIndex
CREATE INDEX "learning_items_collection_id_idx" ON "learning_items"("collection_id");

-- CreateIndex
CREATE INDEX "progress_history_item_id_idx" ON "progress_history"("item_id");

-- CreateIndex
CREATE INDEX "progress_history_session_date_idx" ON "progress_history"("session_date");

-- CreateIndex
CREATE INDEX "progress_history_recorded_at_idx" ON "progress_history"("recorded_at");

-- AddForeignKey
ALTER TABLE "learning_items" ADD CONSTRAINT "learning_items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_history" ADD CONSTRAINT "progress_history_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "learning_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
