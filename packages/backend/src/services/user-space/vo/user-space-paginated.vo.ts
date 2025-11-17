import { UserSpaceResponseVo } from "./user-space.vo";

export class UserSpacePaginatedResponseVo {
  items!: UserSpaceResponseVo[];
  total!: number;
  totalPages!: number;
  page!: number;
  limit!: number;
}