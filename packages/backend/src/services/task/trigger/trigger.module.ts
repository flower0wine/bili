import { Module, OnModuleInit } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "@/services/common/prisma.module";
import { LoggingMiddleware } from "@/services/task/middleware/logging.middleware";
import { PersistenceMiddleware } from "@/services/task/middleware/persistence.middleware";
import { TaskExecutorService } from "@/services/task/task-executor.service";
import { TaskModule } from "@/services/task/task.module";
import { ConfigProviderManager } from "@/services/task/trigger/config/config-provider.manager";
import { ConfigLoader } from "@/services/task/trigger/config/config.loader";
import { ConfigManager } from "@/services/task/trigger/config/config.manager";
import { DatabaseConfigProviderRefactored } from "@/services/task/trigger/config/database.provider";
import { ConfigFileProvider } from "@/services/task/trigger/config/file.provider";
import { CronTriggerManagerService } from "@/services/task/trigger/cron-trigger.service";
import { TriggerController } from "@/services/task/trigger/trigger.controller";
import { TriggerService } from "@/services/task/trigger/trigger.service";

@Module({
  imports: [ScheduleModule.forRoot(), TaskModule, PrismaModule],
  providers: [
    ConfigProviderManager,
    ConfigLoader,
    ConfigManager,
    ConfigFileProvider,
    DatabaseConfigProviderRefactored,
    CronTriggerManagerService,
    TriggerService
  ],
  exports: [ConfigManager, CronTriggerManagerService],
  controllers: [TriggerController]
})
export class TriggerModule implements OnModuleInit {
  constructor(
    private readonly taskExecutor: TaskExecutorService,
    private readonly loggingMiddleware: LoggingMiddleware,
    private readonly persistenceMiddleware: PersistenceMiddleware,
    private readonly providerManager: ConfigProviderManager,
    private readonly fileProvider: ConfigFileProvider,
    private readonly databaseProvider: DatabaseConfigProviderRefactored,
    private readonly cronTriggerManager: CronTriggerManagerService
  ) {}

  async onModuleInit() {
    // 注册中间件
    this.taskExecutor.use(this.loggingMiddleware);
    this.taskExecutor.use(this.persistenceMiddleware);

    // 注册配置提供商
    this.providerManager.registerProvider(this.fileProvider);
    this.providerManager.registerProvider(this.databaseProvider);

    // 初始化 Cron 触发器管理服务
    await this.cronTriggerManager.initialize();
  }
}
