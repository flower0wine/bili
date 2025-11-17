import compression from "compression";
import helmet from "helmet";
import { Logger } from "nestjs-pino";
import { VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/app.module";
import { GlobalValidationPipe } from "./pipes/global-validation.pipe";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });
  app.useLogger(app.get(Logger));

  
  // 设置全局API前缀和版本控制
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1"
  });

  app.useGlobalPipes(new GlobalValidationPipe());

  app.use(compression());
  app.use(helmet());

  await app.listen(process.env.PORT ?? 9000);
}
void bootstrap().catch((err: any) => {
  console.error(err);
  process.exit(1);
});
