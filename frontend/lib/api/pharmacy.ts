import { apiClient } from './client';
import {
  APIResponse,
  PharmacyDashboardStats,
  Application,
  JobPosting,
} from '../types';

export const pharmacyAPI = {
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
};

