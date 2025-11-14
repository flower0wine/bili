import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserSpaceController } from "@/services/user-space/user-space.controller";
import { UserSpaceService } from "@/services/user-space/user-space.service";
import { UserSpaceTask } from "@/services/user-space/user-space.task";

@Module({
  imports: [ConfigModule],
  controllers: [UserSpaceController],
  providers: [UserSpaceService, UserSpaceTask],
  exports: [UserSpaceService, UserSpaceTask]
})
export class UserSpaceModule {}
