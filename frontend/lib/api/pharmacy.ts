import { apiClient } from './client';
import {
  APIResponse,
  PharmacyDashboardStats,
  Application,
  JobPosting,
} from '../types';

export interface PharmacyProfile {
  id: number;
  companyName: string;
  pharmacyName?: string;
  representativeLastName: string;
  representativeFirstName: string;
  phoneNumber?: string;
  faxNumber?: string;
  prefecture?: string;
  address?: string;
  nearestStation?: string;
  minutesFromStation?: number;
  carCommuteAvailable?: boolean;
  establishedDate?: string;
  dailyPrescriptionCount?: number;
  staffCount?: number;
  businessHoursStart?: string;
  businessHoursEnd?: string;
  introduction?: string;
  strengths?: string;
  equipmentSystems?: string;
}

export interface PharmacyBranch {
  id: number;
  pharmacyId: number;
  name: string;
  phoneNumber?: string;
  faxNumber?: string;
  prefecture?: string;
  address?: string;
  nearestStation?: string;
  minutesFromStation?: number;
  carCommuteAvailable?: boolean;
  establishedDate?: string;
  dailyPrescriptionCount?: number;
  staffCount?: number;
  businessHoursStart?: string;
  businessHoursEnd?: string;
  introduction?: string;
  strengths?: string;
  equipmentSystems?: string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const pharmacyAPI = {
  // 薬局プロフィール取得
  getProfile: async (pharmacyId: number) => {
    return apiClient.get<APIResponse<PharmacyProfile>>(
      `/pharmacy/profile/${pharmacyId}`
    );
  },

  // 薬局プロフィール更新
  updateProfile: async (pharmacyId: number, data: Partial<PharmacyProfile>) => {
    return apiClient.put<APIResponse<PharmacyProfile>>(
      `/pharmacy/profile/${pharmacyId}`,
      data
    );
  },

  // ダッシュボード統計
  getDashboardStats: async (pharmacyId: number) => {
    return apiClient.get<APIResponse<PharmacyDashboardStats>>(
      `/pharmacy/dashboard/${pharmacyId}/stats`
    );
  },

  // 最近の応募
  getRecentApplications: async (pharmacyId: number, limit: number = 5) => {
    return apiClient.get<APIResponse<Application[]>>(
      `/pharmacy/dashboard/${pharmacyId}/recent-applications`,
      { params: { limit } }
    );
  },

  // アクティブな求人
  getActiveJobPostings: async (pharmacyId: number, limit: number = 5) => {
    return apiClient.get<APIResponse<JobPosting[]>>(
      `/pharmacy/dashboard/${pharmacyId}/active-job-postings`,
      { params: { limit } }
    );
  },

  // 月別統計
  getMonthlyStats: async (pharmacyId: number, months: number = 6) => {
    return apiClient.get<APIResponse<any>>(
      `/pharmacy/dashboard/${pharmacyId}/monthly-stats`,
      { params: { months } }
    );
  },

  // 薬局プロフィール取得（薬剤師側からもアクセス可能）
  getPublicProfile: async (pharmacyId: number) => {
    return apiClient.get<APIResponse<PharmacyProfile>>(
      `/pharmacy/public-profile/${pharmacyId}`
    );
  },

  // 薬局（Branch）一覧取得
  getBranches: async (pharmacyId: number) => {
    return apiClient.get<APIResponse<PharmacyBranch[]>>(
      `/pharmacy/${pharmacyId}/branches`
    );
  },

  // 薬局（Branch）追加
  createBranch: async (pharmacyId: number, data: Partial<PharmacyBranch>) => {
    return apiClient.post<APIResponse<PharmacyBranch>>(
      `/pharmacy/${pharmacyId}/branches`,
      data
    );
  },

  // 薬局（Branch）更新
  updateBranch: async (pharmacyId: number, branchId: number, data: Partial<PharmacyBranch>) => {
    return apiClient.put<APIResponse<PharmacyBranch>>(
      `/pharmacy/${pharmacyId}/branches/${branchId}`,
      data
    );
  },

  // 薬局（Branch）削除
  deleteBranch: async (pharmacyId: number, branchId: number) => {
    return apiClient.delete<APIResponse>(
      `/pharmacy/${pharmacyId}/branches/${branchId}`
    );
  },

  // 最近の通知取得
  getRecentNotifications: async (limit: number = 5) => {
    return apiClient.get<APIResponse<any[]>>(
      `/pharmacy/dashboard/notifications`,
      { params: { limit } }
    );
  },

  // 全通知取得
  getAllNotifications: async () => {
    return apiClient.get<APIResponse<any[]>>(`/pharmacy/dashboard/notifications/all`);
  },

  // 未読通知数取得
  getNotificationUnreadCount: async () => {
    return apiClient.get<APIResponse<{ count: number }>>(`/pharmacy/dashboard/notifications/unread-count`);
  },

  // 通知を既読にする
  markNotificationRead: async (notificationId: number) => {
    return apiClient.patch<APIResponse>(`/pharmacy/dashboard/notifications/${notificationId}/read`);
  },

  // 全通知を既読にする
  markAllNotificationsRead: async () => {
    return apiClient.patch<APIResponse>(`/pharmacy/dashboard/notifications/read-all`);
  },
};

