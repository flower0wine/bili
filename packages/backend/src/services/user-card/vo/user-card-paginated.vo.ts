import { UserCardResponseVo } from "./user-card.vo";

export class UserCardPaginatedResponseVo {
  items!: UserCardResponseVo[];
  total!: number;
  totalPages!: number;
  page!: number;
  limit!: number;
}