import { Module } from "@nestjs/common";
import { FeishuSyncService } from "./feishu-sync.service";

@Module({
  providers: [FeishuSyncService],
  exports: [FeishuSyncService]
})
export class FeishuSyncModule {}
