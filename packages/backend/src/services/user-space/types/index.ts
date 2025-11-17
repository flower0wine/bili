export interface UserSpaceData {
  mid: number;
  name: string;
  sex: string;
  face: string;
  faceNft: number;
  sign: string;
  level: number;
  birthday?: string;

  // 认证与会员信息
  official?: object;
  vip?: object;
  pendant?: object;
  nameplate?: object;

  // 社交信息
  fansBadge: boolean;
  fansMedal?: object;
  isFollowed: boolean;
  topPhoto?: string;

  // 其他展示信息
  liveRoom?: object;
  tags?: string[] | null;
  sysNotice?: object;
  isSeniorMember: number;
}
