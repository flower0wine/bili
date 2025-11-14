import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from "@nestjs/swagger";
import { getBadRequestContent } from "@/services/swagger.common";
import { UserCardService } from "@/services/user-card/user-card.service";
import { UserCardPaginatedResponseVo } from "@/services/user-card/vo/user-card-paginated.vo";
import { UserCardStatsVo } from "@/services/user-card/vo/user-card-stats.vo";
import { UserCardResponseVo } from "@/services/user-card/vo/user-card.vo";
import { PaginationQueryDto } from "@/dto/pagination-query.dto";
import { UserIdParamDto } from "@/dto/user-id-param.dto";
import {
  UserCardFansRangeQueryDto,
  UserCardStatsQueryDto
} from "@/services/user-card/dto/user-card-query.dto";

@ApiTags("UserCard")
@Controller("user-card")
export class UserCardController {
  constructor(private readonly userCardService: UserCardService) {}

  @Get("latest/:mid")
  @ApiOperation({
    summary: "获取指定用户的最新用户名片数据",
    description: "获取指定用户ID的最新一条用户名片数据"
  })
  @ApiParam({
    name: "mid",
    description: "用户ID",
    example: 2,
    type: "number"
  })
  @ApiOkResponse({
    description: "获取最新用户名片数据成功",
    type: UserCardResponseVo
  })
  @ApiBadRequestResponse({
    description: "参数错误",
    content: getBadRequestContent(undefined)
  })
  async getLatestUserCardData(@Param() params: UserIdParamDto) {
    return await this.userCardService.getLatestUserCardData(params.mid);
  }

  @Get("user/:mid")
  @ApiOperation({
    summary: "分页获取指定用户的所有用户名片数据",
    description: "获取指定用户ID的所有用户名片数据，支持分页"
  })
  @ApiParam({
    name: "mid",
    description: "用户ID",
    example: 2,
    type: "number"
  })
  @ApiQuery({
    name: "page",
    description: "页码，从1开始",
    required: false,
    example: 1
  })
  @ApiQuery({
    name: "limit",
    description: "每页数量，默认10，最大100",
    required: false,
    example: 10
  })
  @ApiOkResponse({
    description: "分页获取用户名片数据成功",
    type: UserCardPaginatedResponseVo
  })
  @ApiBadRequestResponse({
    description: "参数错误",
    content: getBadRequestContent(undefined)
  })
  async getUserCardDataByMid(
    @Param() params: UserIdParamDto,
    @Query() query: PaginationQueryDto
  ) {
    return await this.userCardService.getUserCardDataByMid(params.mid, query);
  }

  @Get("latest")
  @ApiOperation({
    summary: "分页获取所有用户的最新用户名片数据",
    description: "获取所有用户的最新用户名片数据，支持分页"
  })
  @ApiQuery({
    name: "page",
    description: "页码，从1开始",
    required: false,
    example: 1
  })
  @ApiQuery({
    name: "limit",
    description: "每页数量，默认10，最大100",
    required: false,
    example: 10
  })
  @ApiOkResponse({
    description: "分页获取所有用户最新名片数据成功",
    type: UserCardPaginatedResponseVo
  })
  @ApiBadRequestResponse({
    description: "参数错误",
    content: getBadRequestContent(undefined)
  })
  async getAllLatestUserCardData(
    @Query() query: PaginationQueryDto
  ) {
    return await this.userCardService.getAllLatestUserCardData(query);
  }

  @Get("fans-range")
  @ApiOperation({
    summary: "根据粉丝数范围查询用户名片数据",
    description: "根据粉丝数范围分页查询用户名片数据"
  })
  @ApiQuery({
    name: "minFans",
    description: "最小粉丝数",
    required: false,
    example: 10000
  })
  @ApiQuery({
    name: "maxFans",
    description: "最大粉丝数",
    required: false,
    example: 1000000
  })
  @ApiQuery({
    name: "page",
    description: "页码，从1开始",
    required: false,
    example: 1
  })
  @ApiQuery({
    name: "limit",
    description: "每页数量，默认10，最大100",
    required: false,
    example: 10
  })
  @ApiOkResponse({
    description: "根据粉丝数范围查询成功",
    type: UserCardPaginatedResponseVo
  })
  @ApiBadRequestResponse({
    description: "参数错误",
    content: getBadRequestContent(undefined)
  })
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
  @ApiOperation({
    summary: "获取用户名片数据统计信息",
    description: "获取用户名片数据的统计信息"
  })
  @ApiQuery({
    name: "mid",
    description: "用户ID（可选，不提供则返回全局统计）",
    required: false,
    example: 2,
    type: "number"
  })
  @ApiOkResponse({
    description: "获取统计信息成功",
    type: UserCardStatsVo
  })
  @ApiBadRequestResponse({
    description: "参数错误",
    content: getBadRequestContent(undefined)
  })
  async getUserCardStats(@Query() query: UserCardStatsQueryDto) {
    const data = await this.userCardService.getUserCardStats(query.mid);
    return {
      ...data,
      latestRecord: data.latestRecord?.toISOString() || null
    };
  }
}
