declare namespace UserSpace {
  export interface UserSpaceDTO {
    uid: string;
  }

  export interface UserSpaceVO {
    mid: number;
    name: string;
    sex: string;
    face: string;
    sign: string;
    rank: number;
    level: number;
    jointime: number;
    moral: number;
    silence: number;
    email_status: number;
    tel_status: number;
    birthday: string;
    secret: number;
    vip: {
      type: number;
      status: number;
      due_date: number;
      vip_pay_type: number;
      theme_type: number;
      label: {
        path: string;
        text: string;
        label_theme: string;
      };
      avatar_subscript: number;
    };
    official: {
      role: number;
      title: string;
      desc: string;
    };
    pendant: {
      pid: number;
      name: string;
      image: string;
      expire: number;
    };
    nameplate: {
      nid: number;
      name: string;
      image: string;
      image_small: string;
      level: string;
      condition: string;
    };
    is_senior_member: boolean;
  }
}
