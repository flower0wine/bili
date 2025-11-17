import { Controller, Get, Param, Query } from "@nestjs/common";
import { UserSpaceService } from "@/services/user-space/user-space.service";
import { PaginationQueryDto } from "@/dto/pagination-query.dto";
import { UserIdParamDto } from "@/dto/user-id-param.dto";
import {
  UserSpaceLevelRangeQueryDto,
  UserSpaceSearchQueryDto,
  UserSpaceStatsQueryDto
} from "@/services/user-space/dto/user-space-query.dto";

@Controller("user-space")
export class UserSpaceController {
  constructor(private readonly userSpaceService: UserSpaceService) {}

  @Get("latest/:mid")
  async getLatestUserSpaceData(@Param() params: UserIdParamDto) {
    return await this.userSpaceService.getLatestUserSpaceData(params.mid);
  }

  @Get("user/:mid")
  async getUserSpaceDataByMid(
    @Param() params: UserIdParamDto,
    @Query() query: PaginationQueryDto
  ) {
    return await this.userSpaceService.getUserSpaceDataByMid(params.mid, query);
  }

  @Get("latest")
  async getAllLatestUserSpaceData(
    @Query() query: PaginationQueryDto
  ) {
    return await this.userSpaceService.getAllLatestUserSpaceData(query);
  }

  @Get("level-range")
  async getUserSpaceDataByLevelRange(
    @Query() query: UserSpaceLevelRangeQueryDto
  ) {
    return await this.userSpaceService.getUserSpaceDataByLevelRange(
      query.minLevel,
      query.maxLevel,
      query
    );
  }

  @Get("verified")
  async getVerifiedUserSpaceData(
    @Query() query: PaginationQueryDto
  ) {
    return await this.userSpaceService.getVerifiedUserSpaceData(query);
  }

  @Get("search")
  async searchUserSpaceData(
    @Query() query: UserSpaceSearchQueryDto
  ) {
    return await this.userSpaceService.searchUserSpaceData(
      query.keyword,
      {
        page: query.page,
        limit: query.limit
      }
    );
  }

  @Get("stats")
  async getUserSpaceStats(@Query() query: UserSpaceStatsQueryDto) {
    const data = await this.userSpaceService.getUserSpaceStats(query.mid);
    return {
      ...data,
      latestRecord: data.latestRecord?.toISOString() || null
    };
  }
}