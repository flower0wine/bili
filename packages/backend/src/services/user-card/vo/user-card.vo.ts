import { ApiProperty } from "@nestjs/swagger";

export class UserCardResponseVo {
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
    description: "头像URL",
    example:
      "http://i2.hdslb.com/bfs/face/ef0457addb24141e15dfac6fbf45293ccf1e32ab.jpg"
  })
  face!: string;

  @ApiProperty({
    description: "签名",
    example: 'kami.im 直男过气网红 # av362830 "We Are Star Dust"'
  })
  sign!: string;

  @ApiProperty({
    description: "用户等级",
    example: 6
  })
  level!: number;

  @ApiProperty({
    description: "粉丝数",
    example: 969999
  })
  fans!: number;

  @ApiProperty({
    description: "关注数",
    example: 234
  })
  friend!: number;

  @ApiProperty({
    description: "稿件数",
    example: 37
  })
  archiveCount!: number;

  @ApiProperty({
    description: "专栏数",
    example: 0
  })
  articleCount!: number;

  @ApiProperty({
    description: "点赞数",
    example: 3547978
  })
  likeNum!: number;

  @ApiProperty({
    description: "认证信息",
    example: {
      role: 2,
      title: "bilibili创始人(站长)",
      desc: "",
      type: 0
    }
  })
  official?: object;

  @ApiProperty({
    description: "大会员信息",
    example: {
      type: 2,
      status: 1,
      vipType: 2,
      vipStatus: 1
    }
  })
  vip?: object;

  @ApiProperty({
    description: "头像框信息",
    example: {
      pid: 0,
      name: "",
      image: "",
      expire: 0
    }
  })
  pendant?: object;

  @ApiProperty({
    description: "勋章信息",
    example: {
      nid: 10,
      name: "见习偶像",
      image:
        "http://i2.hdslb.com/bfs/face/e93dd9edfa7b9e18bf46fd8d71862327a2350923.png",
      level: "普通勋章"
    }
  })
  nameplate?: object;

  @ApiProperty({
    description: "是否关注此用户",
    example: true
  })
  following!: boolean;

  @ApiProperty({
    description: "主页头图信息",
    example: {
      s_img:
        "http://i1.hdslb.com/bfs/space/768cc4fd97618cf589d23c2711a1d1a729f42235.png",
      l_img:
        "http://i1.hdslb.com/bfs/space/cb1c3ef50e22b6096fde67febe863494caefebad.png"
    }
  })
  space?: object;
}
