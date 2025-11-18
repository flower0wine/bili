import { Controller, Get, Param, Query } from "@nestjs/common";
import { UserIdParamDto } from "@/dto/user-id-param.dto";
import {
  UserCardQueryDto,
  UserFansFriendQueryDto
} from "@/services/user-card/dto/user-card-query.dto";
import { UserCardService } from "@/services/user-card/user-card.service";

@Controller("user-card")
export class UserCardController {
  constructor(private readonly userCardService: UserCardService) {}

  @Get("latest/:mid")
  async getLatestUserCardData(@Param() params: UserIdParamDto) {
    return await this.userCardService.getLatestUserCardData(params.mid);
  }

  @Get("user")
  async getUserCardDataByMid(@Query() query: UserCardQueryDto) {
    return await this.userCardService.getUserCardDataByMid(query.mid, query);
  }

  @Get("fans-friend/:mid")
  async getUserFansFriendHistory(
    @Param() params: UserIdParamDto,
    @Query() query: UserFansFriendQueryDto
  ) {
    return await this.userCardService.getUserFansFriendHistory(
      params.mid,
      query.startDate,
      query.endDate
    );
  }
}
