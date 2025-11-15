import { Injectable, Logger } from "@nestjs/common";
import {
  createPaginatedResponse,
  normalizePagination,
  PaginatedResponse,
  PaginationQuery
} from "@/interfaces/pagination.interface";
import { PrismaService } from "@/services/common/prisma.service";

export interface UserCardData {
  id: number;
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

  // 时间戳
  createdAt: Date;
  updatedAt: Date;
}

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
  async getLatestUserCardData(
    mid: number,
    query: PaginationQuery = {}
  ): Promise<UserCardData | null> {
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

    return this.mapPrismaRecordToUserCardData(record);
  }

  /**
   * 分页获取指定用户的所有用户名片数据
   * @param mid 用户ID
   * @param query 分页参数
   * @returns 分页的用户名片数据
   */
  async getUserCardDataByMid(
    mid: number,
    query: PaginationQuery = {}
  ): Promise<PaginatedResponse<UserCardData>> {
    this.logger.log(`分页获取用户 ${mid} 的用户名片数据`);

    const { page, limit, offset } = normalizePagination(query);
    const orderBy = query.orderBy || { createdAt: "asc" };

    const [records, total] = await Promise.all([
      this.prisma.userCard.findMany({
        where: { mid },
        orderBy,
        skip: offset,
        take: limit
      }),
      this.prisma.userCard.count({
        where: { mid }
      })
    ]);

    const items = records.map((record) =>
      this.mapPrismaRecordToUserCardData(record)
    );

    this.logger.log(`用户 ${mid} 共找到 ${total} 条记录，当前第 ${page} 页`);

    return createPaginatedResponse(items, total, page, limit);
  }

  /**
   * 分页获取所有用户的最新用户名片数据
   * @param query 分页参数
   * @returns 分页的用户名片数据
   */
  async getAllLatestUserCardData(
    query: PaginationQuery = {}
  ): Promise<PaginatedResponse<UserCardData>> {
    this.logger.log("分页获取所有用户的最新用户名片数据");

    const { page, limit, offset, orderBy } = normalizePagination(query);

    // 获取每个用户的最新记录
    const records = await this.prisma.userCard.findMany({
      distinct: ["mid"],
      orderBy,
      skip: offset,
      take: limit
    });

    // 获取总用户数
    const total = await this.prisma.userCard
      .groupBy({
        by: ["mid"],
        _count: true
      })
      .then((result) => result.length);

    const items = records.map((record) =>
      this.mapPrismaRecordToUserCardData(record)
    );

    this.logger.log(`共找到 ${total} 个用户的最新数据，当前第 ${page} 页`);

    return createPaginatedResponse(items, total, page, limit);
  }

  /**
   * 根据粉丝数范围查询用户名片数据
   * @param minFans 最小粉丝数
   * @param maxFans 最大粉丝数
   * @param query 分页参数
   * @returns 分页的用户名片数据
   */
  async getUserCardDataByFansRange(
    minFans?: number,
    maxFans?: number,
    query: PaginationQuery = {}
  ): Promise<PaginatedResponse<UserCardData>> {
    this.logger.log(
      `根据粉丝数范围查询用户名片数据: ${minFans || 0} - ${maxFans || "无上限"}`
    );

    const { page, limit, offset } = normalizePagination(query);
    const orderBy = query.orderBy || { fans: "desc" };

    const whereClause: any = {};
    if (minFans !== undefined || maxFans !== undefined) {
      whereClause.fans = {};
      if (minFans !== undefined) whereClause.fans.gte = minFans;
      if (maxFans !== undefined) whereClause.fans.lte = maxFans;
    }

    const [records, total] = await Promise.all([
      this.prisma.userCard.findMany({
        where: whereClause,
        orderBy,
        distinct: ["mid"],
        skip: offset,
        take: limit
      }),
      this.prisma.userCard.count({ where: whereClause })
    ]);

    const items = records.map((record) =>
      this.mapPrismaRecordToUserCardData(record)
    );

    this.logger.log(`粉丝数范围查询找到 ${total} 条记录，当前第 ${page} 页`);

    return createPaginatedResponse(items, total, page, limit);
  }

  /**
   * 获取用户名片数据统计信息
   * @param mid 用户ID，可选
   * @returns 统计信息
   */
  async getUserCardStats(mid?: number): Promise<{
    totalRecords: number;
    uniqueUsers: number;
    latestRecord: Date | null;
  }> {
    const whereClause = mid ? { mid } : {};

    const [totalRecords, uniqueUsers, latestRecord] = await Promise.all([
      this.prisma.userCard.count({ where: whereClause }),
      this.prisma.userCard
        .groupBy({
          by: ["mid"],
          where: whereClause
        })
        .then((result) => result.length),
      this.prisma.userCard
        .findFirst({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          select: { createdAt: true }
        })
        .then((record) => record?.createdAt || null)
    ]);

    return {
      totalRecords,
      uniqueUsers,
      latestRecord
    };
  }

  /**
   * 将 Prisma 记录映射为 UserCardData 对象
   * @param record Prisma 记录
   * @returns UserCardData 对象
   */
  private mapPrismaRecordToUserCardData(record: any): UserCardData {
    return {
      id: record.id,
      mid: record.mid,
      name: record.name,
      sex: record.sex,
      face: record.face,
      sign: record.sign,
      level: record.level,
      fans: record.fans,
      friend: record.friend,
      archiveCount: record.archiveCount,
      articleCount: record.articleCount,
      likeNum: record.likeNum,
      official: record.official,
      vip: record.vip,
      pendant: record.pendant,
      nameplate: record.nameplate,
      following: record.following,
      space: record.space,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }
}
