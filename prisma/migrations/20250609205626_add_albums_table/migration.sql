-- CreateTable
CREATE TABLE "albums" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "artist_id" TEXT,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);
