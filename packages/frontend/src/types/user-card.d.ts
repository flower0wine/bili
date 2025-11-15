declare namespace UserCard {
  export interface UserCardDTO {
    uid: string;
  }

  export interface UserCardVO {
    id: number;
    mid: number;
    name: string;
    sex: string;
    face: string;
    sign: string;
    rank: number;
    level: number;
    silence: number;
    fans: number;
    friend: number;
    archiveCount: number;
    articleCount: number;
    likeNum: number;
    vip: {
      type: number;
      status: number;
      due_date: number;
      label: string;
    };
    official: {
      role: number;
      title: string;
      desc: string;
    };
    pendant?: Record<string, unknown>;
    nameplate?: Record<string, unknown>;
    following: boolean;
    space?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  }
}
