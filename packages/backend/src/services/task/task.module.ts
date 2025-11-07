import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { PrismaModule } from "@/services/common/prisma.module";
import { UserSpaceModule } from "@/services/user-space/user-space.module";
import { LoggingMiddleware } from "./middleware/logging.middleware";
import { PersistenceMiddleware } from "./middleware/persistence.middleware";
import { TaskExecutorService } from "./task-executor.service";
import { TaskRegistryService } from "./task-registry.service";
import { TaskController } from "./task.controller";
import { UserSpaceSyncTask } from "./tasks/user-space-sync.task";

@Module({
  imports: [DiscoveryModule, PrismaModule, UserSpaceModule],
  providers: [
    TaskRegistryService,
    TaskExecutorService,
    LoggingMiddleware,
    PersistenceMiddleware,
    // 注册任务提供者
    UserSpaceSyncTask
  ],
  controllers: [TaskController],
  exports: [TaskRegistryService, TaskExecutorService]
})
export class TaskModule {}
