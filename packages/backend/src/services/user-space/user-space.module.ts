import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserSpaceController } from "@/services/user-space/user-space.controller";
import { UserSpaceService } from "@/services/user-space/user-space.service";

@Module({
  imports: [ConfigModule],
  controllers: [UserSpaceController],
  providers: [UserSpaceService],
  exports: [UserSpaceService]
})
export class UserSpaceModule {}
