export const UserCardOkExample = {
  summary: "获取用户名片信息成功",
  value: {
    ok: true,
    data: {
      mid: 2,
      name: "碧诗",
      sex: "男",
      face: "http://i2.hdslb.com/bfs/face/ef0457addb24141e15dfac6fbf45293ccf1e32ab.jpg",
      sign: 'kami.im 直男过气网红 # av362830 "We Are Star Dust"',
      level: 6,
      fans: 969999,
      friend: 234,
      archiveCount: 37,
      articleCount: 0,
      likeNum: 3547978,
      official: {
        role: 2,
        title: "bilibili创始人(站长)",
        desc: "",
        type: 0
      },
      vip: {
        type: 2,
        status: 1,
        vipType: 2,
        vipStatus: 1
      },
      following: true,
      space: {
        s_img:
          "http://i1.hdslb.com/bfs/space/768cc4fd97618cf589d23c2711a1d1a729f42235.png",
        l_img:
          "http://i1.hdslb.com/bfs/space/cb1c3ef50e22b6096fde67febe863494caefebad.png"
      }
    }
  }
};

export const UserCardInvalidArgumentExample = {
  summary: "参数缺失或非法",
  value: {
    ok: false,
    code: 1001,
    message: "缺少有效的用户ID"
  }
};

export const UserCardGetInfoFailedExample = {
  summary: "获取信息失败",
  value: {
    ok: false,
    code: 1,
    message: "获取用户名片信息失败：未知错误"
  }
};
