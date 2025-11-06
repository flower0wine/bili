import { Body, Controller, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import { getBadRequestContent } from "@/services/swagger.common";
import { UserSpaceRequestDto } from "@/services/user-space/dto/user-space.dto";
import { UserSpaceService } from "@/services/user-space/user-space.service";
import { UserSpaceResponseVo } from "@/services/user-space/vo/user-space.vo";

@ApiTags("UserSpace")
@Controller("user-space")
export class UserSpaceController {
  constructor(private readonly userSpaceService: UserSpaceService) {}

  @Post("info")
  @ApiOperation({
    summary: "获取用户空间详细信息",
    description:
      "通过用户ID获取指定用户的详细空间信息（使用环境变量中的cookie）"
  })
  @ApiBody({ type: UserSpaceRequestDto, required: true })
  @ApiOkResponse({
    description: "获取用户空间信息成功后的响应格式",
    type: UserSpaceResponseVo
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
          message: "获取用户空间信息失败：未知错误"
        }
      }
    })
  })
  async getUserSpaceInfo(@Body() body: UserSpaceRequestDto) {
    return await this.userSpaceService.getUserSpaceInfo(body);
  }
}
