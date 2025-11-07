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
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "UserSpaceData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CronTrigger" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "cron" TEXT NOT NULL,
    "params" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "source" TEXT NOT NULL DEFAULT 'database',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CronTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskExecution" (
    "id" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "triggerSource" TEXT NOT NULL,
    "triggerName" TEXT,
    "params" JSONB,
    "status" TEXT NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMPTZ(6) NOT NULL,
    "finishedAt" TIMESTAMPTZ(6),
    "duration" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TaskExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSpaceData_mid_key" ON "UserSpaceData"("mid");

-- CreateIndex
CREATE UNIQUE INDEX "CronTrigger_name_key" ON "CronTrigger"("name");

-- CreateIndex
CREATE INDEX "CronTrigger_taskName_idx" ON "CronTrigger"("taskName");

-- CreateIndex
CREATE INDEX "CronTrigger_enabled_idx" ON "CronTrigger"("enabled");

-- CreateIndex
CREATE INDEX "CronTrigger_source_idx" ON "CronTrigger"("source");

-- CreateIndex
CREATE INDEX "TaskExecution_taskName_idx" ON "TaskExecution"("taskName");

-- CreateIndex
CREATE INDEX "TaskExecution_status_idx" ON "TaskExecution"("status");

-- CreateIndex
CREATE INDEX "TaskExecution_triggerSource_idx" ON "TaskExecution"("triggerSource");

-- CreateIndex
CREATE INDEX "TaskExecution_startedAt_idx" ON "TaskExecution"("startedAt");

-- CreateIndex
CREATE INDEX "TaskExecution_createdAt_idx" ON "TaskExecution"("createdAt");
