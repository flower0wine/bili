import { Injectable, Logger } from "@nestjs/common";
import {
  createPaginatedResponse,
  normalizePagination,
  PaginationQuery
} from "@/interfaces/pagination.interface";
import { PrismaService } from "@/services/common/prisma.service";
import { Prisma } from "@prisma/client";
import { UserFansFriendVo } from "./vo/user-fans-friend.vo";

/**
 * 用户名片数据查询服务
 * 用于从数据库查询用户名片统计数据
 */
@Injectable()
export class UserCardService {
  private readonly logger = new Logger(UserCardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取指定用户的最新一条用户名片数据
   * @param mid 用户ID
   * @returns 用户名片数据
   */
  async getLatestUserCardData(mid: number, query: PaginationQuery = {}) {
    this.logger.log(`获取用户 ${mid} 的最新用户名片数据`);

    const { orderBy } = normalizePagination(query);

    const record = await this.prisma.userCard.findFirst({
      where: { mid },
      orderBy
    });

    if (!record) {
      this.logger.warn(`用户 ${mid} 暂无用户名片数据`);
      return null;
    }

    return record;
  }

  /**
   * 分页获取指定用户的所有用户名片数据
   * @param mid 用户ID，如果未提供则获取所有用户的数据
   * @param query 分页参数
   * @returns 分页的用户名片数据
   */
  async getUserCardDataByMid(mid?: number, query: PaginationQuery = {}) {
    const userDescription = mid ? `用户 ${mid}` : "所有用户";
    this.logger.log(`分页获取${userDescription}的用户名片数据`);

    const { page, limit, offset } = normalizePagination(query);
    const orderBy = query.orderBy || { createdAt: "asc" };

    const whereClause = mid ? { mid } : {};

    const [records, total] = await Promise.all([
      this.prisma.userCard.findMany({
        where: whereClause,
        orderBy,
        skip: offset,
        take: limit
      }),
      this.prisma.userCard.count({
        where: whereClause
      })
    ]);

    this.logger.log(
      `${userDescription}共找到 ${total} 条记录，当前第 ${page} 页`
    );

    return createPaginatedResponse(records, total, page, limit);
  }

  /**
   * 获取用户粉丝关注历史数据
   * @param mid 用户ID
   * @param startDate 开始日期（可选）
   * @param endDate 结束日期（可选）
   * @returns 用户粉丝关注历史数据数组
   */
  async getUserFansFriendHistory(
    mid: number,
    startDate?: string,
    endDate?: string
  ): Promise<UserFansFriendVo[]> {
    try {
      this.logger.log(
        `获取用户 ${mid} 的粉丝关注历史数据，日期范围：${startDate || "开始"} - ${endDate || "结束"}`
      );

      // 构建查询条件
      const whereClause: Prisma.UserCardWhereInput = {
        mid
      };

      // 如果有日期范围，添加日期条件
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) {
          whereClause.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          whereClause.createdAt.lte = new Date(endDate);
        }
      }

      const records = await this.prisma.userCard.findMany({
        where: whereClause,
        select: {
          fans: true,
          friend: true,
          createdAt: true
        },
        orderBy: {
          createdAt: "asc"
        }
      });

      this.logger.log(
        `用户 ${mid} 共找到 ${records.length} 条粉丝关注历史记录`
      );

      return records.map((record) => ({
        fans: record.fans,
        friend: record.friend,
        createdAt: record.createdAt
      }));
    } catch (error) {
      this.logger.error(
        `获取用户 ${mid} 粉丝关注历史数据失败`,
        error instanceof Error ? error.stack : error
      );
      throw new Error("Failed to fetch user fans friend history");
    }
  }
}
