import { Injectable, Logger } from "@nestjs/common";
import { PaginationQueryDto } from "@/dto/pagination-query.dto";
import {
  createPaginatedResponse,
  normalizePagination
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
    query: PaginationQueryDto = {}
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
  async getUserSpaceDataByMid(mid: number, query: PaginationQueryDto = {}) {
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
  async getAllLatestUserSpaceData(query: PaginationQueryDto = {}) {
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
}
