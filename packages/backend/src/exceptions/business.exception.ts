import { HttpException, HttpStatus } from "@nestjs/common";

export class ValidationException extends HttpException {
  constructor(
    message: string | string[],
    status: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    const response = {
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      error: "Validation failed"
    };
    super(response, status);
  }
}
