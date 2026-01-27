import { apiClient } from './client';
import { APIResponse } from '../types';

export interface JobPosting {
  id: number;
  pharmacyId: number;
  title: string;
  description?: string;
  workLocation: string;
  dailyWage: number;
  desiredWorkDays?: number;
  workStartPeriodFrom?: string;
  workStartPeriodTo?: string;
  recruitmentDeadline?: string;
  requirements?: string;
  desiredWorkHours?: string;
  totalCompensation?: number;
  platformFee?: number;
  status: string;
  viewCount?: number;
  applicationCount?: number;
  publishedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobPostingInput {
  pharmacyId: number;
  title: string;
  description?: string;
  workLocation: string;
  dailyWage: number;
  desiredWorkDays?: number;
  workStartPeriodFrom?: string;
  workStartPeriodTo?: string;
  recruitmentDeadline?: string;
  requirements?: string;
  desiredWorkHours?: string;
  totalCompensation?: number;
  platformFee?: number;
}

export interface SearchParams {
  prefecture?: string;
  minWage?: number;
  maxWage?: number;
  status?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

export const jobPostingsAPI = {
  // 求人作成
  create: async (input: CreateJobPostingInput) => {
    return apiClient.post<APIResponse<JobPosting>>('/job-postings', input);
  },

  // 求人更新
  update: async (id: number, input: Partial<CreateJobPostingInput>) => {
    return apiClient.put<APIResponse<JobPosting>>(`/job-postings/${id}`, input);
  },

  // 求人削除
  delete: async (id: number) => {
    return apiClient.delete<APIResponse>(`/job-postings/${id}`);
  },

  // 求人公開
  publish: async (id: number) => {
    return apiClient.post<APIResponse>(`/job-postings/${id}/publish`);
  },

  // 求人非公開
  unpublish: async (id: number) => {
    return apiClient.post<APIResponse>(`/job-postings/${id}/unpublish`);
  },

  // 求人詳細取得
  getById: async (id: number) => {
    return apiClient.get<APIResponse<JobPosting>>(`/job-postings/${id}`);
  },

  // 薬局の求人一覧取得
  getByPharmacy: async (pharmacyId: number) => {
    return apiClient.get<APIResponse<JobPosting[]>>(
      `/job-postings/pharmacy/${pharmacyId}`
    );
  },

  // 求人検索
  search: async (params: SearchParams) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    return apiClient.get<APIResponse<JobPosting[]>>(
      `/job-postings/search?${queryParams.toString()}`
    );
  },
};

