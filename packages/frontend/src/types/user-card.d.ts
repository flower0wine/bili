declare namespace UserCard {
  export interface UserCardDTO {
    uid: string;
  }

  export interface UserCardVO {
    name: string;
    sex: string;
    face: string;
    sign: string;
    rank: number;
    level: number;
    silence: number;
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
  }
}