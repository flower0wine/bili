import { Global, Module } from "@nestjs/common";
import { PrismaService } from "@/services/common/prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule {}
