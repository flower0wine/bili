import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { STATUS_CODE } from "@/constants";
import { UserCardRequestDto } from "@/services/user-card/dto/user-card.dto";

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

@Injectable()
export class UserCardService {
  private readonly logger = new Logger(UserCardService.name);

  constructor(private configService: ConfigService) {}

  async getUserCardInfo(opts: UserCardRequestDto): Promise<UserCardData> {
    const { mid, photo = false } = opts;

    if (!mid || typeof mid !== "number") {
      const message = "缺少有效的用户ID";
      this.logger.warn(message);
      throw new HttpException(
        { code: STATUS_CODE.INVALID_ARGUMENT, message },
        HttpStatus.BAD_REQUEST
      );
    }

    // 从环境变量中获取cookie
    const cookie = this.configService.get<string>("BILIBILI_COOKIE");
    if (!cookie) {
      const message = "未配置BILIBILI_COOKIE环境变量";
      this.logger.error(message);
      throw new HttpException(
        { code: STATUS_CODE.INVALID_ARGUMENT, message },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      // 构造请求URL
      const params = new URLSearchParams({
        mid: mid.toString(),
        photo: photo.toString()
      });

      const url = `https://api.bilibili.com/x/web-interface/card?${params}`;
      this.logger.log(`请求用户名片信息: ${url}`);

      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
          Referer: "https://www.bilibili.com/",
          Cookie: cookie
        }
      });

      const response = await res.json();

      if (response.code !== 0) {
        const message = `获取用户名片信息失败: ${response.message || "未知错误"}`;
        this.logger.error(message);
        throw new HttpException(
          { code: STATUS_CODE.UNKNOWN_ERROR, message },
          HttpStatus.BAD_REQUEST
        );
      }

      const { data } = response;
      const { card } = data;

      return {
        mid: parseInt(card.mid),
        name: card.name,
        sex: card.sex,
        face: card.face,
        sign: card.sign,
        level: card.level_info?.current_level,

        // 统计信息
        fans: card.fans,
        friend: card.friend,
        archiveCount: data.archive_count,
        articleCount: data.article_count,
        likeNum: data.like_num,

        // 认证与会员信息
        official: card.Official,
        vip: card.vip,
        pendant: card.pendant,
        nameplate: card.nameplate,

        // 社交信息
        following: data.following,
        space: data.space
      };
    } catch (error: any) {
      const message = `获取用户名片信息失败：${error?.message || error}`;
      this.logger.error(message, error?.stack || undefined);
      throw new HttpException(
        { message, code: STATUS_CODE.UNKNOWN_ERROR },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
