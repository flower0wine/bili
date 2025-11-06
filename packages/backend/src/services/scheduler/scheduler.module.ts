import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "@/services/common/prisma.module";
import { DynamicSchedulerService } from "@/services/scheduler/dynamic-scheduler.service";
import { SchedulerInitService } from "@/services/scheduler/scheduler-init.service";
import { SchedulerController } from "@/services/scheduler/scheduler.controller";
import { SchedulerService } from "@/services/scheduler/scheduler.service";
import { UserSpaceModule } from "@/services/user-space/user-space.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    PrismaModule,
    UserSpaceModule
  ],
  controllers: [SchedulerController],
  providers: [SchedulerService, DynamicSchedulerService, SchedulerInitService],
  exports: [SchedulerService, DynamicSchedulerService, SchedulerInitService]
})
export class SchedulerModule {}
