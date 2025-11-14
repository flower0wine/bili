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
import { UserSpaceService } from "@/services/user-space/user-space.service";
import { UserSpacePaginatedResponseVo } from "@/services/user-space/vo/user-space-paginated.vo";
import { UserSpaceStatsVo } from "@/services/user-space/vo/user-space-stats.vo";
import { UserSpaceResponseVo } from "@/services/user-space/vo/user-space.vo";
import { PaginationQueryDto } from "@/dto/pagination-query.dto";
import { UserIdParamDto } from "@/dto/user-id-param.dto";
import {
  UserSpaceLevelRangeQueryDto,
  UserSpaceSearchQueryDto,
  UserSpaceStatsQueryDto
} from "@/services/user-space/dto/user-space-query.dto";

@ApiTags("UserSpace")
@Controller("user-space")
export class UserSpaceController {
  constructor(private readonly userSpaceService: UserSpaceService) {}

  @Get("latest/:mid")
  @ApiOperation({
    summary: "获取指定用户的最新用户空间数据",
    description: "获取指定用户ID的最新一条用户空间数据"
  })
  @ApiParam({
    name: "mid",
    description: "用户ID",
    example: 2,
    type: "number"
  })
  @ApiOkResponse({
    description: "获取最新用户空间数据成功",
    type: UserSpaceResponseVo
  })
  @ApiBadRequestResponse({
    description: "参数错误",
    content: getBadRequestContent(undefined)
  })
  async getLatestUserSpaceData(@Param() params: UserIdParamDto) {
    return await this.userSpaceService.getLatestUserSpaceData(params.mid);
  }

  @Get("user/:mid")
  @ApiOperation({
    summary: "分页获取指定用户的所有用户空间数据",
    description: "获取指定用户ID的所有用户空间数据，支持分页"
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
    description: "分页获取用户空间数据成功",
    type: UserSpacePaginatedResponseVo
  })
  @ApiBadRequestResponse({
    description: "参数错误",
    content: getBadRequestContent(undefined)
  })
  async getUserSpaceDataByMid(
    @Param() params: UserIdParamDto,
    @Query() query: PaginationQueryDto
  ) {
    return await this.userSpaceService.getUserSpaceDataByMid(params.mid, query);
  }

  @Get("latest")
  @ApiOperation({
    summary: "分页获取所有用户的最新用户空间数据",
    description: "获取所有用户的最新用户空间数据，支持分页"
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
    description: "分页获取所有用户最新空间数据成功",
    type: UserSpacePaginatedResponseVo
  })
  @ApiBadRequestResponse({
    description: "参数错误",
    content: getBadRequestContent(undefined)
  })
  async getAllLatestUserSpaceData(
    @Query() query: PaginationQueryDto
  ) {
    return await this.userSpaceService.getAllLatestUserSpaceData(query);
  }

  @Get("level-range")
  @ApiOperation({
    summary: "根据等级范围查询用户空间数据",
    description: "根据等级范围分页查询用户空间数据"
  })
  @ApiQuery({
    name: "minLevel",
    description: "最小等级",
    required: false,
    example: 1
  })
  @ApiQuery({
    name: "maxLevel",
    description: "最大等级",
    required: false,
    example: 6
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
    description: "根据等级范围查询成功",
    type: UserSpacePaginatedResponseVo
  })
  @ApiBadRequestResponse({
    description: "参数错误",
    content: getBadRequestContent(undefined)
  })
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
  @ApiOperation({
    summary: "根据认证状态查询用户空间数据",
    description: "查询已认证用户的用户空间数据"
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
    description: "查询认证用户空间数据成功",
    type: UserSpacePaginatedResponseVo
  })
  @ApiBadRequestResponse({
    description: "参数错误",
    content: getBadRequestContent(undefined)
  })
  async getVerifiedUserSpaceData(
    @Query() query: PaginationQueryDto
  ) {
    return await this.userSpaceService.getVerifiedUserSpaceData(query);
  }

  @Get("search")
  @ApiOperation({
    summary: "搜索用户空间数据",
    description: "根据关键词搜索用户空间数据"
  })
  @ApiQuery({
    name: "keyword",
    description: "搜索关键词",
    required: true,
    example: "测试用户"
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
    description: "搜索用户空间数据成功",
    type: UserSpacePaginatedResponseVo
  })
  @ApiBadRequestResponse({
    description: "参数错误",
    content: getBadRequestContent(undefined)
  })
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
  @ApiOperation({
    summary: "获取用户空间数据统计信息",
    description: "获取用户空间数据的统计信息，包括等级分布"
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
    type: UserSpaceStatsVo
  })
  @ApiBadRequestResponse({
    description: "参数错误",
    content: getBadRequestContent(undefined)
  })
  async getUserSpaceStats(@Query() query: UserSpaceStatsQueryDto) {
    const data = await this.userSpaceService.getUserSpaceStats(query.mid);
    return {
      ...data,
      latestRecord: data.latestRecord?.toISOString() || null
    };
  }
}
