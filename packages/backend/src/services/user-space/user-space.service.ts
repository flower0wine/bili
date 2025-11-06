import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { STATUS_CODE } from "@/constants";
import { UserSpaceRequestDto } from "@/services/user-space/dto/user-space.dto";
import { encWbi, getWbiKeys } from "@/utils/wbi.util";

export interface UserSpaceData {
  mid: number;
  name: string;
  sex: string;
  level: number;
  face: string;
  sign: string;
  userStatus: object;
  following: number;
  follower: number;
}

@Injectable()
export class UserSpaceService {
  private readonly logger = new Logger(UserSpaceService.name);

  constructor(private configService: ConfigService) {}

  async getUserSpaceInfo(opts: UserSpaceRequestDto): Promise<UserSpaceData> {
    const { mid } = opts;

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

    // 从cookie中提取SESSDATA
    const sessdataMatch = cookie.match(/SESSDATA=([^;]+)/);
    if (!sessdataMatch || !sessdataMatch[1]) {
      const message = "BILIBILI_COOKIE中未找到SESSDATA";
      this.logger.error(message);
      throw new HttpException(
        { code: STATUS_CODE.INVALID_ARGUMENT, message },
        HttpStatus.BAD_REQUEST
      );
    }
    const sessdata = sessdataMatch[1];

    try {
      // 获取WBI签名密钥
      const { img_key, sub_key } = await getWbiKeys(sessdata);

      // 构造请求参数
      const params: { [key: string]: string | number } = { mid };

      // 生成WBI签名
      const signedQuery = encWbi(params, img_key, sub_key);

      // 请求用户空间信息
      const url = `https://api.bilibili.com/x/space/wbi/acc/info?${signedQuery}`;
      this.logger.log(`请求用户空间信息: ${url}`);

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
        const message = `获取用户空间信息失败: ${response.message || "未知错误"}`;
        this.logger.error(message);
        throw new HttpException(
          { code: STATUS_CODE.UNKNOWN_ERROR, message },
          HttpStatus.BAD_REQUEST
        );
      }

      const { data } = response;

      return {
        mid: data.mid,
        name: data.name,
        sex: data.sex,
        level: data.level,
        face: data.face,
        sign: data.sign,
        userStatus: data.vip,
        following: data.following,
        follower: data.follower
      };
    } catch (error: any) {
      const message = `获取用户空间信息失败：${error?.message || error}`;
      this.logger.error(message, error?.stack || undefined);
      throw new HttpException(
        { message, code: STATUS_CODE.UNKNOWN_ERROR },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
