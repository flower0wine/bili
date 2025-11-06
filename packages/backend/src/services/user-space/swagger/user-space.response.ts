import { HttpException, HttpStatus } from "@nestjs/common";
import { STATUS_CODE } from "@/constants";

export const UserSpaceResponseKeys = {
  OK: "OK",
  INVALID_ARGUMENT: "INVALID_ARGUMENT",
  GET_INFO_FAILED: "GET_INFO_FAILED"
} as const;

export const USER_SPACE_RESPONSES = {
  [UserSpaceResponseKeys.OK]: {
    code: STATUS_CODE.OK,
    http: HttpStatus.OK,
    message: "获取用户空间信息成功"
  },
  [UserSpaceResponseKeys.INVALID_ARGUMENT]: {
    code: STATUS_CODE.INVALID_ARGUMENT,
    http: HttpStatus.BAD_REQUEST,
    message: "缺少有效的用户ID或SESSDATA"
  },
  [UserSpaceResponseKeys.GET_INFO_FAILED]: {
    code: STATUS_CODE.UNKNOWN_ERROR,
    http: HttpStatus.BAD_REQUEST,
    message: "获取用户空间信息失败"
  }
} as const;

export type UserSpaceResponseKey = keyof typeof UserSpaceResponseKeys;

export function userSpaceResponse(
  key: UserSpaceResponseKey,
  message?: string
): HttpException {
  const spec = USER_SPACE_RESPONSES[key];
  const msg = message ?? spec.message;
  return new HttpException({ code: spec.code, message: msg }, spec.http);
}
