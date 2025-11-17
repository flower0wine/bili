import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  Type
} from "@nestjs/common";
import { ValidationException } from "../exceptions/business.exception";

/**
 * 全局验证管道
 * 使用 class-validator 验证 DTO
 * 开发环境下支持金手指功能
 */
@Injectable()
export class GlobalValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    // 如果没有元类型或者是基本类型，直接返回
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // 开发金手指：检查是否跳过验证
    if (process.env.NODE_ENV === "development") {
      const request = this.getCurrentRequest();

      if (request && request.headers["x-dev-cheat"] === "skip-validation") {
        console.log("🔧 开发金手指：跳过验证");
        return plainToInstance(metatype, value);
      }
    }

    // 转换为类实例
    const object = plainToInstance(metatype, value);

    // 执行验证
    const errors = await validate(object, {
      whitelist: true, // 自动移除未定义的属性
      forbidNonWhitelisted: true, // 如果有未定义的属性则报错
      transform: true, // 自动转换类型
      validationError: {
        target: false, // 不包含验证目标对象
        value: false // 不包含验证值
      }
    });

    if (errors.length > 0) {
      // 开发环境：提供更详细的错误信息
      if (process.env.NODE_ENV === "development") {
        console.log("🚨 验证错误详情:", {
          errors: errors.map((err) => ({
            property: err.property,
            value: err.value,
            constraints: err.constraints
          })),
          hint: "可使用 x-dev-cheat: skip-validation 跳过验证"
        });
      }

      const errorMessages = this.buildErrorMessage(errors);
      throw new ValidationException(errorMessages);
    }

    return object;
  }

  /**
   * 检查是否需要验证
   */
  private toValidate(metatype: Type<any>): boolean {
    const types: Type<any>[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  /**
   * 获取当前请求对象
   */
  private getCurrentRequest(): any {
    try {
      return (global as any).__current_request__ || null;
    } catch {
      return null;
    }
  }

  /**
   * 构建错误消息
   */
  private buildErrorMessage(errors: ValidationError[]): string {
    const messages: string[] = [];

    const processError = (error: ValidationError, prefix = "") => {
      const property = prefix ? `${prefix}.${error.property}` : error.property;

      if (error.constraints) {
        const constraintMessages = Object.values(error.constraints);
        messages.push(
          ...constraintMessages.map((msg) => `${property}: ${msg}`)
        );
      }

      if (error.children && error.children.length > 0) {
        error.children.forEach((child) => processError(child, property));
      }
    };

    errors.forEach((error) => processError(error));

    return messages.join("; ");
  }
}
