import { apiClient } from './client';
import { APIResponse } from '../types';

export interface Application {
  id: number;
  jobPostingId: number;
  pharmacistId: number;
  coverLetter?: string;
  status: string;
  appliedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationInput {
  jobPostingId: number;
  pharmacistId: number;
  coverLetter?: string;
  nearestStation?: string;
  workExperienceTypes?: string[];
}

export const applicationsAPI = {
  // 応募作成
  create: async (input: CreateApplicationInput) => {
    return apiClient.post<APIResponse<Application>>('/applications', input);
  },

  // 応募詳細取得
  getById: async (id: number) => {
    return apiClient.get<APIResponse<Application>>(`/applications/${id}`);
  },

  // 応募ステータス更新（薬局側）
  updateStatus: async (
    id: number,
    status: string,
    rejectionReason?: string
  ) => {
    return apiClient.patch<APIResponse>(`/applications/${id}/status`, {
      status,
      rejectionReason,
    });
  },

  // 応募取り下げ（薬剤師側）
  withdraw: async (id: number, pharmacistId: number) => {
    return apiClient.post<APIResponse>(`/applications/${id}/withdraw`, {
      pharmacistId,
    });
  },

  // 薬局の応募一覧取得
  getByPharmacy: async (pharmacyId: number, status?: string) => {
    const url = status
      ? `/applications/pharmacy/${pharmacyId}?status=${status}`
      : `/applications/pharmacy/${pharmacyId}`;
    return apiClient.get<APIResponse<Application[]>>(url);
  },

  // 薬剤師の応募一覧取得
  getByPharmacist: async (pharmacistId: number, status?: string) => {
    const url = status
      ? `/applications/pharmacist/${pharmacistId}?status=${status}`
      : `/applications/pharmacist/${pharmacistId}`;
    return apiClient.get<APIResponse<Application[]>>(url);
  },
};

