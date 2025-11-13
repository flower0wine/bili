import { AxiosResponse } from 'axios';
import { api } from '@/lib/api/axios';

export const userSpaceApi = {
  getUserSpaceInfo: async (data: UserSpace.UserSpaceDTO): Promise<AxiosResponse<Http.ApiResponse<UserSpace.UserSpaceVO>>> => {
    return await api.post<Http.ApiResponse<UserSpace.UserSpaceVO>>('/user-space/info', data);
  },
};