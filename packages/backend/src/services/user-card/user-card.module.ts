import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserCardController } from "@/services/user-card/user-card.controller";
import { UserCardService } from "@/services/user-card/user-card.service";
import { UserCardTask } from "@/services/user-card/user-card.task";

@Module({
  imports: [ConfigModule],
  controllers: [UserCardController],
  providers: [UserCardService, UserCardTask],
  exports: [UserCardService, UserCardTask]
})
export class UserCardModule {}
