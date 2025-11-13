import { VersioningType } from "@nestjs/common";
import compression from "compression";
import helmet from "helmet";
import { Logger } from "nestjs-pino";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "@/app.module";
import { GlobalExceptionsFilter } from "@/filters/global-exceptions.filter";
import { TransformInterceptor } from "@/interceptors/response-transform.interceptor";
import { description, name, version } from "../package.json";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });
  app.useLogger(app.get(Logger));

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new GlobalExceptionsFilter(httpAdapterHost, app.get(Logger))
  );
  app.useGlobalInterceptors(new TransformInterceptor());

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
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use(compression());
  app.use(helmet());

  await app.listen(process.env.PORT ?? 9000);
}
void bootstrap().catch((err: any) => {
  console.error(err);
  process.exit(1);
});
