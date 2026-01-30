import { apiClient } from './client';
import { APIResponse } from '../types';

export interface Payment {
  id: number;
  contractId: number;
  pharmacyId: number;
  amount: number;
  paymentType: string;
  paymentStatus: string;
  paymentDate?: string;
  transferName?: string;
  confirmationNote?: string;
  reportedAt?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
  contract?: any;
}

export interface Penalty {
  id: number;
  pharmacyId: number;
  contractId?: number;
  penaltyType: string;
  reason: string;
  penaltyStatus: string;
  imposedAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export const paymentsAPI = {
  // 支払い報告（薬局側）
  reportPayment: async (
    paymentId: number,
    pharmacyId: number,
    paymentDate: string,
    transferName: string,
    confirmationNote?: string
  ) => {
    return apiClient.post<APIResponse<Payment>>(`/payments/${paymentId}/report`, {
      pharmacyId,
      paymentDate,
      transferName,
      confirmationNote,
    });
  },

  // 請求書一覧を取得（薬局側）
  getByPharmacy: async (pharmacyId: number, status?: string) => {
    const url = status
      ? `/payments/pharmacy/${pharmacyId}?status=${status}`
      : `/payments/pharmacy/${pharmacyId}`;
    return apiClient.get<APIResponse<Payment[]>>(url);
  },

  // 請求書詳細を取得
  getById: async (paymentId: number) => {
    return apiClient.get<APIResponse<Payment>>(`/payments/${paymentId}`);
  },

  // ペナルティ一覧を取得（薬局側）
  getPenaltiesByPharmacy: async (pharmacyId: number) => {
    return apiClient.get<APIResponse<Penalty[]>>(`/payments/pharmacy/${pharmacyId}/penalties`);
  },

  // ペナルティ解除申請（薬局側）
  requestPenaltyResolution: async (penaltyId: number, pharmacyId: number, note: string) => {
    return apiClient.post<APIResponse<Penalty>>(
      `/payments/penalties/${penaltyId}/request-resolution`,
      {
        pharmacyId,
        note,
      }
    );
  },
};



