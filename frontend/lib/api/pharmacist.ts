import { apiClient } from './client';
import {
  APIResponse,
  PharmacistDashboardStats,
  Notification,
  Application,
  Contract,
} from '../types';

export const pharmacistAPI = {
  // ダッシュボード統計
  getDashboardStats: async (pharmacistId: number) => {
    return apiClient.get<APIResponse<PharmacistDashboardStats>>(
      `/pharmacist/dashboard/${pharmacistId}/stats`
    );
  },

  // 最近の通知
  getRecentNotifications: async (limit: number = 5) => {
    return apiClient.get<APIResponse<Notification[]>>(
      `/pharmacist/dashboard/notifications`,
      { params: { limit } }
    );
  },

  // 全通知
  getAllNotifications: async () => {
    return apiClient.get<APIResponse<Notification[]>>(
      `/pharmacist/dashboard/notifications/all`
    );
  },

  // 未読通知数
  getUnreadCount: async () => {
    return apiClient.get<APIResponse<{ count: number }>>(
      `/pharmacist/dashboard/notifications/unread-count`
    );
  },

  // 通知を既読にする
  markNotificationRead: async (notificationId: number) => {
    return apiClient.patch<APIResponse<void>>(
      `/pharmacist/dashboard/notifications/${notificationId}/read`
    );
  },

  // 全通知を既読にする
  markAllNotificationsRead: async () => {
    return apiClient.patch<APIResponse<void>>(
      `/pharmacist/dashboard/notifications/read-all`
    );
  },

  // 進行中の応募
  getActiveApplications: async (pharmacistId: number, limit: number = 5) => {
    return apiClient.get<APIResponse<Application[]>>(
      `/pharmacist/dashboard/${pharmacistId}/active-applications`,
      { params: { limit } }
    );
  },

  // 進行中の契約
  getActiveContracts: async (pharmacistId: number, limit: number = 5) => {
    return apiClient.get<APIResponse<Contract[]>>(
      `/pharmacist/dashboard/${pharmacistId}/active-contracts`,
      { params: { limit } }
    );
  },

  // 応募履歴統計
  getApplicationHistory: async (pharmacistId: number) => {
    return apiClient.get<APIResponse<any>>(
      `/pharmacist/dashboard/${pharmacistId}/application-history`
    );
  },
};

