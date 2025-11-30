export class UserCardResponseVo {
  mid!: number;
  name!: string;
  sex!: string;
  face!: string;
  sign!: string;
  level!: number;
  fans!: number;
  friend!: number;
  archiveCount!: number;
  articleCount!: number;
  likeNum!: number;
  official?: object;
  vip?: object;
  pendant?: object;
  nameplate?: object;
  following!: boolean;
  space?: object;
}
