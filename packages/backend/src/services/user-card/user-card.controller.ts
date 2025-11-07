import { Body, Controller, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import { getBadRequestContent } from "@/services/swagger.common";
import { UserCardRequestDto } from "@/services/user-card/dto/user-card.dto";
import { UserCardService } from "@/services/user-card/user-card.service";
import { UserCardResponseVo } from "@/services/user-card/vo/user-card.vo";

@ApiTags("UserCard")
@Controller("user-card")
export class UserCardController {
  constructor(private readonly userCardService: UserCardService) {}

  @Post("info")
  @ApiOperation({
    summary: "获取用户名片信息",
    description: "通过用户ID获取指定用户的名片信息（使用环境变量中的cookie）"
  })
  @ApiBody({ type: UserCardRequestDto, required: true })
  @ApiOkResponse({
    description: "获取用户名片信息成功后的响应格式",
    type: UserCardResponseVo
  })
  @ApiBadRequestResponse({
    description: "请求参数缺失/非法或获取信息失败",
    content: getBadRequestContent({
      invalidArgument: {
        summary: "参数缺失或非法",
        value: {
          ok: false,
          code: 1001,
          message: "缺少有效的用户ID"
        }
      },
      getInfoFailed: {
        summary: "获取信息失败",
        value: {
          ok: false,
          code: 1,
          message: "获取用户名片信息失败：未知错误"
        }
      }
    })
  })
  async getUserCardInfo(@Body() body: UserCardRequestDto) {
    return await this.userCardService.getUserCardInfo(body);
  }
}
