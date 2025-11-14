import compression from "compression";
import helmet from "helmet";
import { Logger } from "nestjs-pino";
import { VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "@/app.module";
import { description, name, version } from "../package.json";
import { GlobalValidationPipe } from "./pipes/global-validation.pipe";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });
  app.useLogger(app.get(Logger));

  // Swagger (OpenAPI) setup
  const config = new DocumentBuilder()
    .setTitle(name)
    .setDescription(description)
    .setVersion(version)
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "bearer"
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/docs", app, document, {
    jsonDocumentUrl: "/docs/json",
    swaggerOptions: {
      persistAuthorization: true
    }
  });

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
