-- CreateTable
CREATE TABLE "UserSpaceData" (
    "id" SERIAL NOT NULL,
    "mid" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "face" TEXT NOT NULL,
    "sign" TEXT NOT NULL,
    "userStatus" JSONB NOT NULL,
    "following" INTEGER NOT NULL,
    "follower" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSpaceData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CronJob" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cron" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "lastRun" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CronJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSpaceData_mid_key" ON "UserSpaceData"("mid");

-- CreateIndex
CREATE UNIQUE INDEX "CronJob_name_key" ON "CronJob"("name");
