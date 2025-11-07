import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserCardController } from "@/services/user-card/user-card.controller";
import { UserCardService } from "@/services/user-card/user-card.service";

@Module({
  imports: [ConfigModule],
  controllers: [UserCardController],
  providers: [UserCardService],
  exports: [UserCardService]
})
export class UserCardModule {}
