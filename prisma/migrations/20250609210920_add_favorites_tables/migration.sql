-- CreateTable
CREATE TABLE "favorite_artists" (
    "id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,

    CONSTRAINT "favorite_artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_albums" (
    "id" TEXT NOT NULL,
    "album_id" TEXT NOT NULL,

    CONSTRAINT "favorite_albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_tracks" (
    "id" TEXT NOT NULL,
    "track_id" TEXT NOT NULL,

    CONSTRAINT "favorite_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorite_artists_artist_id_key" ON "favorite_artists"("artist_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_albums_album_id_key" ON "favorite_albums"("album_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_tracks_track_id_key" ON "favorite_tracks"("track_id");
