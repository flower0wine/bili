import { ApiProperty } from "@nestjs/swagger";

export class UserSpaceResponseVo {
  @ApiProperty({
    description: "用户ID",
    example: 2
  })
  mid!: number;

  @ApiProperty({
    description: "用户名",
    example: "碧诗"
  })
  name!: string;

  @ApiProperty({
    description: "性别",
    example: "男"
  })
  sex!: string;

  @ApiProperty({
    description: "用户等级",
    example: 6
  })
  level!: number;

  @ApiProperty({
    description: "头像URL",
    example: "https://i0.hdslb.com/bfs/face/member/noface.jpg"
  })
  face!: string;

  @ApiProperty({
    description: "签名",
    example: "祝大家龙年大吉！"
  })
  sign!: string;

  @ApiProperty({
    description: "用户状态",
    example: {
      vip: {
        type: 2,
        status: 1,
        due_date: 1762444800000,
        vip_pay_type: 1,
        theme_type: 0,
        label: {
          path: "",
          text: "年度大会员",
          label_theme: "annual_vip",
          text_color: "#FFFFFF",
          bg_style: 1,
          bg_color: "#FB7299",
          border_color: ""
        },
        avatar_subscript: 1,
        nickname_color: "#FB7299"
      }
    }
  })
  userStatus!: object;

  @ApiProperty({
    description: "关注数",
    example: 100
  })
  following!: number;

  @ApiProperty({
    description: "粉丝数",
    example: 1000000
  })
  follower!: number;
}
