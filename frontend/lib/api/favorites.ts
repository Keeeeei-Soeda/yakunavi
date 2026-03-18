import { apiClient } from './client';
import { APIResponse } from '../types';

export interface FavoriteJobItem {
  id: number;
  pharmacistId: number;
  jobPostingId: number;
  createdAt: string;
  jobPosting: {
    id: number;
    title: string;
    workLocation: string;
    desiredWorkDays: number;
    dailyWage: number;
    totalCompensation: number;
    status: string;
    pharmacy: {
      id: number;
      companyName?: string;
      pharmacyName?: string;
      prefecture?: string;
    };
  };
}

export const favoritesAPI = {
  // お気に入り一覧取得
  getFavorites: () =>
    apiClient.get<APIResponse<FavoriteJobItem[]>>('/pharmacist/favorites'),

  // お気に入り件数取得
  getFavoriteCount: () =>
    apiClient.get<APIResponse<{ count: number }>>('/pharmacist/favorites/count'),

  // お気に入り状態確認
  checkFavorite: (jobPostingId: number) =>
    apiClient.get<APIResponse<{ isFavorite: boolean }>>(
      `/pharmacist/favorites/check/${jobPostingId}`
    ),

  // お気に入り追加
  addFavorite: (jobPostingId: number) =>
    apiClient.post<APIResponse<any>>(`/pharmacist/favorites/${jobPostingId}`, {}),

  // お気に入り解除
  removeFavorite: (jobPostingId: number) =>
    apiClient.delete<APIResponse<any>>(`/pharmacist/favorites/${jobPostingId}`),
};
