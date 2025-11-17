import { Controller, Get, Param, Query } from "@nestjs/common";
import { UserCardService } from "@/services/user-card/user-card.service";
import { PaginationQueryDto } from "@/dto/pagination-query.dto";
import { UserIdParamDto } from "@/dto/user-id-param.dto";
import {
  UserCardFansRangeQueryDto,
  UserCardStatsQueryDto
} from "@/services/user-card/dto/user-card-query.dto";

@Controller("user-card")
export class UserCardController {
  constructor(private readonly userCardService: UserCardService) {}

  @Get("latest/:mid")
  async getLatestUserCardData(@Param() params: UserIdParamDto) {
    return await this.userCardService.getLatestUserCardData(params.mid);
  }

  @Get("user/:mid")
  async getUserCardDataByMid(
    @Param() params: UserIdParamDto,
    @Query() query: PaginationQueryDto
  ) {
    return await this.userCardService.getUserCardDataByMid(params.mid, query);
  }

  @Get("latest")
  async getAllLatestUserCardData(
    @Query() query: PaginationQueryDto
  ) {
    return await this.userCardService.getAllLatestUserCardData(query);
  }

  @Get("fans-range")
  async getUserCardDataByFansRange(
    @Query() query: UserCardFansRangeQueryDto
  ) {
    return await this.userCardService.getUserCardDataByFansRange(
      query.minFans,
      query.maxFans,
      query
    );
  }

  @Get("stats")
  async getUserCardStats(@Query() query: UserCardStatsQueryDto) {
    const data = await this.userCardService.getUserCardStats(query.mid);
    return {
      ...data,
      latestRecord: data.latestRecord?.toISOString() || null
    };
  }
}