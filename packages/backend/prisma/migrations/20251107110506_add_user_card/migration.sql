-- CreateTable
CREATE TABLE "UserCard" (
    "id" SERIAL NOT NULL,
    "mid" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "face" TEXT NOT NULL,
    "sign" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "fans" INTEGER NOT NULL,
    "friend" INTEGER NOT NULL,
    "archiveCount" INTEGER NOT NULL,
    "articleCount" INTEGER NOT NULL,
    "likeNum" INTEGER NOT NULL,
    "official" JSONB,
    "vip" JSONB,
    "pendant" JSONB,
    "nameplate" JSONB,
    "following" BOOLEAN NOT NULL DEFAULT false,
    "space" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "UserCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCard_mid_key" ON "UserCard"("mid");
