import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { PrismaModule } from "@/services/common/prisma.module";
import { UserCardModule } from "@/services/user-card/user-card.module";
import { UserSpaceModule } from "@/services/user-space/user-space.module";
import { LoggingMiddleware } from "./middleware/logging.middleware";
import { PersistenceMiddleware } from "./middleware/persistence.middleware";
import { TaskExecutorService } from "./task-executor.service";
import { TaskRegistryService } from "./task-registry.service";
import { TaskController } from "./task.controller";
import { UserCardSyncTask } from "./tasks/user-card-sync.task";
import { UserSpaceSyncTask } from "./tasks/user-space-sync.task";

@Module({
  imports: [DiscoveryModule, PrismaModule, UserSpaceModule, UserCardModule],
  providers: [
    TaskRegistryService,
    TaskExecutorService,
    LoggingMiddleware,
    PersistenceMiddleware,
    // 注册任务提供者
    UserSpaceSyncTask,
    UserCardSyncTask
  ],
  controllers: [TaskController],
  exports: [
    TaskRegistryService,
    TaskExecutorService,
    LoggingMiddleware,
    PersistenceMiddleware
  ]
})
export class TaskModule {}
