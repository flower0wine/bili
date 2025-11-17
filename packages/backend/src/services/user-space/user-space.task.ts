import { Injectable, Logger } from "@nestjs/common";
import { TaskException } from "@/exceptions/task.exception";
import { UserSpaceTaskParams } from "@/services/user-space/dto/user-space-task-params.dto";
import { encWbi, getWbiKeys } from "@/utils/wbi.util";
import { UserSpaceData } from "./types";

export interface UserSpaceDataResponse {
  mid: number;
  name: string;
  sex: string;
  face: string;
  face_nft: number;
  sign: string;
  level: number;
  birthday?: string;

  // 认证与会员信息
  official?: object;
  vip?: object;
  pendant?: object;
  nameplate?: object;

  // 社交信息
  fans_badge: boolean;
  fans_medal?: object;
  is_followed: boolean;
  top_photo?: string;

  // 其他展示信息
  live_room?: object;
  tags?: string[] | null;
  sys_notice?: object;
  is_senior_member: number;
}

/**
 * 用户空间任务
 * 负责获取B站用户空间信息
 */
@Injectable()
export class UserSpaceTask {
  private readonly logger = new Logger(UserSpaceTask.name);

  constructor() {}

  /**
   * 获取用户空间信息
   * @param params 任务参数
   * @returns 用户空间数据
   */
  async executeGetUserSpaceInfo(
    params: UserSpaceTaskParams
  ): Promise<UserSpaceData> {
    const { mid, cookie } = params;

    // 验证参数
    if (!mid || typeof mid !== "number") {
      const message = "缺少有效的用户ID";
      this.logger.warn(message);
      throw new TaskException(message);
    }

    // 验证cookie
    if (!cookie || typeof cookie !== "string") {
      const message = "缺少有效的Cookie";
      this.logger.error(message);
      throw new TaskException(message);
    }

    // 从cookie中提取SESSDATA
    const sessdataMatch = cookie.match(/SESSDATA=([^;]+)/);
    if (!sessdataMatch || !sessdataMatch[1]) {
      const message = "BILIBILI_COOKIE中未找到SESSDATA";
      this.logger.error(message);
      throw new TaskException(message);
    }
    const sessdata = sessdataMatch[1];

    try {
      // 获取WBI签名密钥
      const { img_key, sub_key } = await getWbiKeys(sessdata);

      // 构造请求参数
      const requestParams: { [key: string]: string | number } = { mid };

      // 生成WBI签名
      const signedQuery = encWbi(requestParams, img_key, sub_key);

      // 请求用户空间信息
      const url = `https://api.bilibili.com/x/space/wbi/acc/info?${signedQuery}`;
      this.logger.log(`请求用户空间信息: ${url}`);

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
          Referer: "https://www.bilibili.com/",
          Cookie: cookie
        },
        // 设置超时
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        const message = `HTTP请求失败: ${response.status} ${response.statusText}`;
        this.logger.error(message);
        throw new TaskException(message);
      }

      const result = (await response.json()) as {
        code: number;
        message: string;
        data: UserSpaceDataResponse;
      };

      // 检查API响应
      if (result.code !== 0) {
        const message = `获取用户空间信息失败: ${result.message || "未知错误"}`;
        this.logger.error(`API响应错误: ${JSON.stringify(result)}`);
        throw new TaskException(message);
      }

      const { data } = result;

      // 验证响应数据
      if (!data) {
        const message = "API响应中缺少用户数据";
        this.logger.error(message);
        throw new TaskException(message);
      }

      // 构造返回数据
      const userSpaceData = {
        mid: data.mid || mid,
        name: data.name || "未知用户",
        sex: data.sex || "未知",
        face: data.face || "",
        faceNft: data.face_nft || 0,
        sign: data.sign || "",
        level: data.level || 0,
        birthday: data.birthday,

        // 认证与会员信息
        official: data.official,
        vip: data.vip,
        pendant: data.pendant,
        nameplate: data.nameplate,

        // 社交信息
        fansBadge: data.fans_badge || false,
        fansMedal: data.fans_medal,
        isFollowed: data.is_followed || false,
        topPhoto: data.top_photo,

        // 其他展示信息
        liveRoom: data.live_room,
        tags: data.tags,
        sysNotice: data.sys_notice,
        isSeniorMember: data.is_senior_member || 0
      };

      this.logger.log(`成功获取用户 ${mid} 的空间信息: ${userSpaceData.name}`);
      return userSpaceData as UserSpaceData;
    } catch (error: any) {
      // 如果是已知的任务异常，直接重新抛出
      if (error instanceof TaskException) {
        throw error;
      }

      if (error instanceof Error) {
        const message = `获取用户空间信息失败: ${error.message}`;
        this.logger.error(message);
        throw new TaskException(message);
      }

      throw error;
    }
  }
}
