import { HttpException, HttpStatus } from "@nestjs/common";
import { STATUS_CODE } from "@/constants";

export const UserCardResponseKeys = {
  OK: "OK",
  INVALID_ARGUMENT: "INVALID_ARGUMENT",
  GET_INFO_FAILED: "GET_INFO_FAILED"
} as const;

export const USER_CARD_RESPONSES = {
  [UserCardResponseKeys.OK]: {
    code: STATUS_CODE.OK,
    http: HttpStatus.OK,
    message: "获取用户名片信息成功"
  },
  [UserCardResponseKeys.INVALID_ARGUMENT]: {
    code: STATUS_CODE.INVALID_ARGUMENT,
    http: HttpStatus.BAD_REQUEST,
    message: "缺少有效的用户ID"
  },
  [UserCardResponseKeys.GET_INFO_FAILED]: {
    code: STATUS_CODE.UNKNOWN_ERROR,
    http: HttpStatus.BAD_REQUEST,
    message: "获取用户名片信息失败"
  }
} as const;

export type UserCardResponseKey = keyof typeof UserCardResponseKeys;

export function userCardResponse(
  key: UserCardResponseKey,
  message?: string
): HttpException {
  const spec = USER_CARD_RESPONSES[key];
  const msg = message ?? spec.message;
  return new HttpException({ code: spec.code, message: msg }, spec.http);
}
