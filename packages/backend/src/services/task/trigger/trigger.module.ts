import { Module, OnModuleInit } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "@/services/common/prisma.module";
import { LoggingMiddleware } from "../middleware/logging.middleware";
import { PersistenceMiddleware } from "../middleware/persistence.middleware";
import { TaskExecutorService } from "../task-executor.service";
import { TaskModule } from "../task.module";
import { DatabaseConfigProvider } from "./config/database.provider";
import { ConfigFileProvider } from "./config/file.provider";
import { TriggerConfigLoaderService } from "./config/trigger-config-loader.service";
import { CronTriggerService } from "./cron-trigger.service";
import { TriggerController } from "./trigger.controller";

@Module({
  imports: [ScheduleModule.forRoot(), TaskModule, PrismaModule],
  providers: [
    CronTriggerService,
    TriggerConfigLoaderService,
    ConfigFileProvider,
    DatabaseConfigProvider
  ],
  exports: [
    CronTriggerService,
    TriggerConfigLoaderService,
    DatabaseConfigProvider
  ],
  controllers: [TriggerController]
})
export class TriggerModule implements OnModuleInit {
  constructor(
    private readonly cronTriggerService: CronTriggerService,
    private readonly configLoader: TriggerConfigLoaderService,
    private readonly taskExecutor: TaskExecutorService,
    private readonly loggingMiddleware: LoggingMiddleware,
    private readonly persistenceMiddleware: PersistenceMiddleware,
    private readonly configFileProvider: ConfigFileProvider,
    private readonly databaseConfigProvider: DatabaseConfigProvider
  ) {}

  async onModuleInit() {
    // 注册中间件
    this.taskExecutor.use(this.loggingMiddleware);
    this.taskExecutor.use(this.persistenceMiddleware);

    // 注册配置源提供者（配置文件优先级更高）
    this.configLoader.registerProvider(this.configFileProvider);
    this.configLoader.registerProvider(this.databaseConfigProvider);

    // 初始化触发器服务（加载配置并注册变更监听器）
    await this.cronTriggerService.initialize();
  }
}
