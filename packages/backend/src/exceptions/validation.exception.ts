import { ValidationError } from "class-validator";
import { HttpStatus } from "@nestjs/common";
import { BusinessException } from "./business.exception";

const ERROR_TYPE = "VALIDATION_ERROR";

/**
 * 验证异常
 * 用于 DTO 验证失败时抛出
 * 后端只负责提供原始的验证错误信息，前端决定如何展示
 */
export class ValidationException extends BusinessException {
  constructor(
    errors: ValidationError[],
    status: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    // 提取错误详情
    const errorDetails = extractValidationErrorDetails(errors);

    // 构建错误对象
    const errorObject = {
      type: ERROR_TYPE,
      details: errorDetails
    };

    const message = Object.entries(errorDetails)
      .map(([key, value]) => {
        return `${key}: <br>${value.join("<br>")}`;
      })
      .join("<br>");

    // 调用父类构造函数
    super(message, errorObject, status);
  }
}

/**
 * 从 ValidationError 数组提取错误详情
 * 返回格式：{ fieldName: ["error1", "error2"], ... }
 */
function extractValidationErrorDetails(
  errors: ValidationError[]
): Record<string, string[]> {
  const details: Record<string, string[]> = {};

  const processError = (error: ValidationError, prefix = "") => {
    const property = prefix ? `${prefix}.${error.property}` : error.property;

    if (error.constraints) {
      const constraintMessages = Object.values(error.constraints);
      if (!details[property]) {
        details[property] = [];
      }
      details[property].push(...constraintMessages);
    }

    if (error.children && error.children.length > 0) {
      error.children.forEach((child) => processError(child, property));
    }
  };

  errors.forEach((error) => processError(error));

  return details;
}
