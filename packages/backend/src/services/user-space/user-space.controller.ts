import { Controller, Get, Param, Query } from "@nestjs/common";
import { PaginationQueryDto } from "@/dto/pagination-query.dto";
import { UserIdParamDto } from "@/dto/user-id-param.dto";
import { UserSpaceService } from "@/services/user-space/user-space.service";

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
  async getAllLatestUserSpaceData(@Query() query: PaginationQueryDto) {
    return await this.userSpaceService.getAllLatestUserSpaceData(query);
  }
}
