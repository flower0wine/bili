import { AxiosResponse } from 'axios';
import { api } from '@/lib/api/axios';

export const userCardApi = {
  getUserCardInfo: async (data: UserCard.UserCardDTO): Promise<AxiosResponse<Http.ApiResponse<UserCard.UserCardVO>>> => {
    return await api.post<Http.ApiResponse<UserCard.UserCardVO>>('/v1/user-card/info', data);
  },
};