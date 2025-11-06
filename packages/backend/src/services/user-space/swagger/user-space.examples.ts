export const UserSpaceOkExample = {
  summary: "获取用户空间信息成功",
  value: {
    ok: true,
    data: {
      mid: 2,
      name: "碧诗",
      sex: "男",
      level: 6,
      face: "https://i0.hdslb.com/bfs/face/member/noface.jpg",
      sign: "祝大家龙年大吉！",
      userStatus: {
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
      },
      following: 100,
      follower: 1000000
    }
  }
};

export const UserSpaceInvalidArgumentExample = {
  summary: "参数缺失或非法",
  value: {
    ok: false,
    code: 1001,
    message: "缺少有效的用户ID"
  }
};

export const UserSpaceGetInfoFailedExample = {
  summary: "获取信息失败",
  value: {
    ok: false,
    code: 1,
    message: "获取用户空间信息失败：未知错误"
  }
};
