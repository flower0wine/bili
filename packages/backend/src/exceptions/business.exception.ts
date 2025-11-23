import { HttpException, HttpStatus } from "@nestjs/common";

/**
 * 业务错误对象接口
 */
export interface IBusinessError {
  type: string;
  [key: string]: any;
}

/**
 * 业务错误异常基类
 * 所有业务异常都应该继承这个类
 * 统一管理错误信息的结构
 */
export class BusinessException extends HttpException {
  /**
   * 业务错误对象
   */
  protected errorObject: IBusinessError;

  /**
   * 错误消息
   */
  protected errorMessage: string;

  constructor(
    message: string,
    errorObject: IBusinessError,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR
  ) {
    const response = {
      statusCode: status,
      message,
      error: errorObject
    };

    super(response, status);

    this.errorMessage = message;
    this.errorObject = errorObject;
  }

  /**
   * 获取业务错误对象
   */
  getErrorObject(): IBusinessError {
    return this.errorObject;
  }

  /**
   * 获取错误消息
   */
  getErrorMessage(): string {
    return this.errorMessage;
  }
}
