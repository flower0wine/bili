import { Injectable, Logger } from "@nestjs/common";
import {
  createPaginatedResponse,
  normalizePagination,
  PaginationQuery
} from "@/interfaces/pagination.interface";
import { PrismaService } from "@/services/common/prisma.service";
import { Prisma, UserSpaceData } from "@prisma/client";

/**
 * 用户空间数据查询服务
 * 用于从数据库查询用户空间信息
 */
@Injectable()
export class UserSpaceService {
  private readonly logger = new Logger(UserSpaceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取指定用户的最新一条用户空间数据
   * @param mid 用户ID
   * @returns 用户空间数据
   */
  async getLatestUserSpaceData(
    mid: number,
    query: PaginationQuery = {}
  ): Promise<UserSpaceData | null> {
    this.logger.log(`获取用户 ${mid} 的最新用户空间数据`);

    const { orderBy } = normalizePagination(query);

    const record = await this.prisma.userSpaceData.findFirst({
      where: { mid },
      orderBy
    });

    if (!record) {
      this.logger.warn(`用户 ${mid} 暂无用户空间数据`);
      return null;
    }

    return record;
  }

  /**
   * 分页获取指定用户的所有用户空间数据
   * @param mid 用户ID
   * @param query 分页参数
   * @returns 分页的用户空间数据
   */
  async getUserSpaceDataByMid(mid: number, query: PaginationQuery = {}) {
    this.logger.log(`分页获取用户 ${mid} 的用户空间数据`);

    const { page, limit, offset, orderBy } = normalizePagination(query);

    const [records, total] = await Promise.all([
      this.prisma.userSpaceData.findMany({
        where: { mid },
        orderBy,
        skip: offset,
        take: limit
      }),
      this.prisma.userSpaceData.count({
        where: { mid }
      })
    ]);

    this.logger.log(`用户 ${mid} 共找到 ${total} 条记录，当前第 ${page} 页`);

    return createPaginatedResponse(records, total, page, limit);
  }

  /**
   * 分页获取所有用户的最新用户空间数据
   * @param query 分页参数
   * @returns 分页的用户空间数据
   */
  async getAllLatestUserSpaceData(query: PaginationQuery = {}) {
    this.logger.log("分页获取所有用户的最新用户空间数据");

    const { page, limit, offset, orderBy } = normalizePagination(query);

    // 获取每个用户的最新记录
    const records = await this.prisma.userSpaceData.findMany({
      distinct: ["mid"],
      orderBy,
      skip: offset,
      take: limit
    });

    // 获取总用户数
    const total = await this.prisma.userSpaceData
      .groupBy({
        by: ["mid"],
        _count: true
      })
      .then((result) => result.length);

    this.logger.log(`共找到 ${total} 个用户的最新数据，当前第 ${page} 页`);

    return createPaginatedResponse(records, total, page, limit);
  }

  /**
   * 根据等级范围查询用户空间数据
   * @param minLevel 最小等级
   * @param maxLevel 最大等级
   * @param query 分页参数
   * @returns 分页的用户空间数据
   */
  async getUserSpaceDataByLevelRange(
    minLevel?: number,
    maxLevel?: number,
    query: PaginationQuery = {}
  ) {
    this.logger.log(
      `根据等级范围查询用户空间数据: ${minLevel || 0} - ${maxLevel || "无上限"}`
    );

    const { page, limit, offset } = normalizePagination(query);
    const orderBy = query.orderBy || { level: "desc" };

    const whereClause: Prisma.UserSpaceDataWhereInput = {};
    if (minLevel !== undefined || maxLevel !== undefined) {
      whereClause.level = {};
      if (minLevel !== undefined) {
        whereClause.level.gte = minLevel;
      }
      if (maxLevel !== undefined) {
        whereClause.level.lte = maxLevel;
      }
    }

    const [records, total] = await Promise.all([
      this.prisma.userSpaceData.findMany({
        where: whereClause,
        orderBy,
        distinct: ["mid"],
        skip: offset,
        take: limit
      }),
      this.prisma.userSpaceData.count({ where: whereClause })
    ]);

    this.logger.log(`等级范围查询找到 ${total} 条记录，当前第 ${page} 页`);

    return createPaginatedResponse(records, total, page, limit);
  }

  /**
   * 根据认证状态查询用户空间数据
   * @param query 分页参数
   * @returns 分页的用户空间数据
   */
  async getVerifiedUserSpaceData(query: PaginationQuery = {}) {
    this.logger.log("根据认证状态查询用户空间数据");

    const { page, limit, offset, orderBy } = normalizePagination(query);

    const [records, total] = await Promise.all([
      this.prisma.userSpaceData.findMany({
        where: {
          official: {
            not: undefined
          }
        },
        orderBy,
        distinct: ["mid"],
        skip: offset,
        take: limit
      }),
      this.prisma.userSpaceData.count({
        where: {
          official: {
            not: undefined
          }
        }
      })
    ]);

    this.logger.log(`认证用户查询找到 ${total} 条记录，当前第 ${page} 页`);

    return createPaginatedResponse(records, total, page, limit);
  }

  /**
   * 获取用户空间数据统计信息
   * @param mid 用户ID，可选
   * @returns 统计信息
   */
  async getUserSpaceStats(mid?: number) {
    const whereClause = mid ? { mid } : {};

    const [totalRecords, uniqueUsers, latestRecord, levelDistribution] =
      await Promise.all([
        this.prisma.userSpaceData.count({ where: whereClause }),
        this.prisma.userSpaceData
          .groupBy({
            by: ["mid"],
            where: whereClause
          })
          .then((result) => result.length),
        this.prisma.userSpaceData
          .findFirst({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            select: { createdAt: true }
          })
          .then((record) => record?.createdAt || null),
        this.prisma.userSpaceData
          .groupBy({
            by: ["level"],
            where: whereClause,
            _count: true
          })
          .then((result) =>
            result.reduce(
              (acc, item) => {
                acc[item.level] = item._count;
                return acc;
              },
              {} as Record<number, number>
            )
          )
      ]);

    return {
      totalRecords,
      uniqueUsers,
      latestRecord,
      levelDistribution
    };
  }

  /**
   * 搜索用户空间数据
   * @param keyword 搜索关键词（用户名）
   * @param query 分页参数
   * @returns 分页的用户空间数据
   */
  async searchUserSpaceData(keyword: string, query: PaginationQuery = {}) {
    this.logger.log(`搜索用户空间数据: ${keyword}`);

    const { page, limit, offset, orderBy } = normalizePagination(query);

    const [records, total] = await Promise.all([
      this.prisma.userSpaceData.findMany({
        where: {
          name: {
            contains: keyword,
            mode: "insensitive"
          }
        },
        orderBy,
        distinct: ["mid"],
        skip: offset,
        take: limit
      }),
      this.prisma.userSpaceData.count({
        where: {
          name: {
            contains: keyword,
            mode: "insensitive"
          }
        }
      })
    ]);

    this.logger.log(`搜索找到 ${total} 条记录，当前第 ${page} 页`);

    return createPaginatedResponse(records, total, page, limit);
  }
}
