import { Injectable, Logger } from "@nestjs/common";
import { TaskException } from "@/exceptions/task.exception";
import { UserCardTaskParams } from "@/services/user-card/dto/user-card-task-params.dto";

export interface UserCardData {
  mid: number;
  name: string;
  sex: string;
  face: string;
  sign: string;
  level: number;

  // 统计信息
  fans: number;
  friend: number;
  archiveCount: number;
  articleCount: number;
  likeNum: number;

  // 认证与会员信息
  official?: object;
  vip?: object;
  pendant?: object;
  nameplate?: object;

  // 社交信息
  following: boolean;
  space?: object;
}

/**
 * 用户名片任务
 * 负责获取B站用户名片信息
 */
@Injectable()
export class UserCardTask {
  private readonly logger = new Logger(UserCardTask.name);

  constructor() {}

  /**
   * 获取用户名片信息
   * @param params 任务参数
   * @returns 用户名片数据
   */
  async executeGetUserCardInfo(
    params: UserCardTaskParams
  ): Promise<UserCardData> {
    const { mid, photo = false, cookie } = params;

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

    try {
      // 构造请求URL
      const requestParams = new URLSearchParams({
        mid: mid.toString(),
        photo: photo.toString()
      });

      const url = `https://api.bilibili.com/x/web-interface/card?${requestParams}`;
      this.logger.log(`请求用户名片信息: ${url}`);

      // 发起HTTP请求
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

      const result = await response.json();

      // 检查API响应
      if (result.code !== 0) {
        const message = `获取用户名片信息失败: ${result.message || "未知错误"}`;
        this.logger.error(`API响应错误: ${JSON.stringify(result)}`);
        throw new TaskException(message);
      }

      const { data } = result;
      const { card } = data;

      // 验证响应数据
      if (!card) {
        const message = "API响应中缺少卡片数据";
        this.logger.error(message);
        throw new TaskException(message);
      }

      // 构造返回数据
      const userCardData: UserCardData = {
        mid: parseInt(card.mid) || mid,
        name: card.name || "未知用户",
        sex: card.sex || "未知",
        face: card.face || "",
        sign: card.sign || "",
        level: card.level_info?.current_level || 0,

        // 统计信息
        fans: card.fans || 0,
        friend: card.friend || 0,
        archiveCount: data.archive_count || 0,
        articleCount: data.article_count || 0,
        likeNum: data.like_num || 0,

        // 认证与会员信息
        official: card.Official,
        vip: card.vip,
        pendant: card.pendant,
        nameplate: card.nameplate,

        // 社交信息
        following: data.following || false,
        space: data.space
      };

      this.logger.log(`成功获取用户 ${mid} 的名片信息: ${userCardData.name}`);
      return userCardData;
    } catch (error: any) {
      // 如果是已知的任务异常，直接重新抛出
      if (error instanceof TaskException) {
        throw error;
      }

      // 处理其他未预期的错误
      const message = `获取用户名片信息失败：${error?.message || error}`;
      this.logger.error(message, error?.stack || undefined);
      throw new TaskException(message);
    }
  }
}
