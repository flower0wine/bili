import { Request, Response } from "express";
import { Logger } from "nestjs-pino";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Injectable
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { STATUS_CODE } from "@/constants";
import { BusinessException } from "@/exceptions/business.exception";
import { IApiResponse } from "@/types/response.interface";
import { ResponseUtil } from "@/utils/response.util";

@Injectable()
@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(HttpAdapterHost) private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: Logger
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const traceId: string | undefined =
      (req.id as string) || (req.headers["x-request-id"] as string | undefined);

    // 简单确定状态码与业务码
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const code = status >= 400 ? Number(status) : STATUS_CODE.UNKNOWN_ERROR;

    let message = "Internal server error";
    let errorObject: unknown = undefined;

    // 由业务本身来决定错误是否向前端暴露
    if (exception instanceof BusinessException) {
      message = exception.getErrorMessage();
      errorObject = exception.getErrorObject();
    }

    // 记录结构化错误日志
    this.logger.error(
      {
        err: exception,
        code,
        status,
        method: req?.method,
        url: req?.url
      },
      message
    );

    // 返回统一结构
    const responseBody: IApiResponse<never, unknown> = ResponseUtil.error(
      code,
      message,
      errorObject
    );
    // 总是 200 返回，由客户端根据 ok/code 处理
    if (traceId) {
      res.setHeader("x-request-id", traceId);
    }
    httpAdapter.reply(ctx.getResponse(), responseBody, HttpStatus.OK);
  }
}
