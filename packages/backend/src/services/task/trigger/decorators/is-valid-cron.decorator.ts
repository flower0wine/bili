import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import { validateCronExpression } from "cron";

/**
 * Cron 表达式验证约束
 */
@ValidatorConstraint({ name: "isValidCron", async: false })
export class IsValidCronConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== "string") {
      return false;
    }

    try {
      // 使用 cron 库的验证函数
      // validateCronExpression 返回 { valid: boolean, error?: CronError }
      const result = validateCronExpression(value);
      return result.valid === true;
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return "cron 表达式格式不正确，请使用标准的 Cron 格式";
  }
}

/**
 * 验证 Cron 表达式的装饰器
 * @example
 * @IsValidCron()
 * cron: string;
 */
export function IsValidCron(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidCronConstraint
    });
  };
}
