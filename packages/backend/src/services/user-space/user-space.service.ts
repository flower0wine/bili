import { Injectable, Logger } from "@nestjs/common";
import {
  createPaginatedResponse,
  normalizePagination,
  PaginatedResponse,
  PaginationQuery
} from "@/interfaces/pagination.interface";
import { PrismaService } from "@/services/common/prisma.service";

export interface UserSpaceData {
  id: number;
  mid: number;
  name: string;
  sex: string;
  face: string;
  faceNft: number;
  sign: string;
  level: number;
  birthday?: string;

  // 认证与会员信息
  official?: object;
  vip?: object;
  pendant?: object;
  nameplate?: object;

  // 社交信息
  fansBadge: boolean;
  fansMedal?: object;
  isFollowed: boolean;
  topPhoto?: string;

  // 其他展示信息
  liveRoom?: object;
  tags?: string[] | null;
  sysNotice?: object;
  isSeniorMember: number;

  // 时间戳
  createdAt: Date;
  updatedAt: Date;
}

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

    return this.mapPrismaRecordToUserSpaceData(record);
  }

  /**
   * 分页获取指定用户的所有用户空间数据
   * @param mid 用户ID
   * @param query 分页参数
   * @returns 分页的用户空间数据
   */
  async getUserSpaceDataByMid(
    mid: number,
    query: PaginationQuery = {}
  ): Promise<PaginatedResponse<UserSpaceData>> {
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

    const items = records.map((record) =>
      this.mapPrismaRecordToUserSpaceData(record)
    );

    this.logger.log(`用户 ${mid} 共找到 ${total} 条记录，当前第 ${page} 页`);

    return createPaginatedResponse(items, total, page, limit);
  }

  /**
   * 分页获取所有用户的最新用户空间数据
   * @param query 分页参数
   * @returns 分页的用户空间数据
   */
  async getAllLatestUserSpaceData(
    query: PaginationQuery = {}
  ): Promise<PaginatedResponse<UserSpaceData>> {
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

    const items = records.map((record) =>
      this.mapPrismaRecordToUserSpaceData(record)
    );

    this.logger.log(`共找到 ${total} 个用户的最新数据，当前第 ${page} 页`);

    return createPaginatedResponse(items, total, page, limit);
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
  ): Promise<PaginatedResponse<UserSpaceData>> {
    this.logger.log(
      `根据等级范围查询用户空间数据: ${minLevel || 0} - ${maxLevel || "无上限"}`
    );

    const { page, limit, offset } = normalizePagination(query);
    const orderBy = query.orderBy || { level: "desc" };

    const whereClause: any = {};
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

    const items = records.map((record) =>
      this.mapPrismaRecordToUserSpaceData(record)
    );

    this.logger.log(`等级范围查询找到 ${total} 条记录，当前第 ${page} 页`);

    return createPaginatedResponse(items, total, page, limit);
  }

  /**
   * 根据认证状态查询用户空间数据
   * @param query 分页参数
   * @returns 分页的用户空间数据
   */
  async getVerifiedUserSpaceData(
    query: PaginationQuery = {}
  ): Promise<PaginatedResponse<UserSpaceData>> {
    this.logger.log("根据认证状态查询用户空间数据");

    const { page, limit, offset, orderBy } = normalizePagination(query);

    const [records, total] = await Promise.all([
      this.prisma.userSpaceData.findMany({
        where: {
          official: {
            not: null as any
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
            not: null as any
          }
        }
      })
    ]);

    const items = records.map((record) =>
      this.mapPrismaRecordToUserSpaceData(record)
    );

    this.logger.log(`认证用户查询找到 ${total} 条记录，当前第 ${page} 页`);

    return createPaginatedResponse(items, total, page, limit);
  }

  /**
   * 获取用户空间数据统计信息
   * @param mid 用户ID，可选
   * @returns 统计信息
   */
  async getUserSpaceStats(mid?: number): Promise<{
    totalRecords: number;
    uniqueUsers: number;
    latestRecord: Date | null;
    levelDistribution: Record<number, number>;
  }> {
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
  async searchUserSpaceData(
    keyword: string,
    query: PaginationQuery = {}
  ): Promise<PaginatedResponse<UserSpaceData>> {
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

    const items = records.map((record) =>
      this.mapPrismaRecordToUserSpaceData(record)
    );

    this.logger.log(`搜索找到 ${total} 条记录，当前第 ${page} 页`);

    return createPaginatedResponse(items, total, page, limit);
  }

  /**
   * 将 Prisma 记录映射为 UserSpaceData 对象
   * @param record Prisma 记录
   * @returns UserSpaceData 对象
   */
  private mapPrismaRecordToUserSpaceData(record: any): UserSpaceData {
    return {
      id: record.id,
      mid: record.mid,
      name: record.name,
      sex: record.sex,
      face: record.face,
      faceNft: record.faceNft,
      sign: record.sign,
      level: record.level,
      birthday: record.birthday,
      official: record.official,
      vip: record.vip,
      pendant: record.pendant,
      nameplate: record.nameplate,
      fansBadge: record.fansBadge,
      fansMedal: record.fansMedal,
      isFollowed: record.isFollowed,
      topPhoto: record.topPhoto,
      liveRoom: record.liveRoom,
      tags: record.tags,
      sysNotice: record.sysNotice,
      isSeniorMember: record.isSeniorMember,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }
}
