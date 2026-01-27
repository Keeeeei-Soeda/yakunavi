import { apiClient } from './client';
import { APIResponse } from '../types';

export interface Contract {
    id: number;
    applicationId: number;
    pharmacyId: number;
    pharmacistId: number;
    jobPostingId: number;
    initialWorkDate: string;
    workDays: number;
    dailyWage: number;
    totalCompensation: number;
    platformFee: number;
    workHours?: string;
    status: string;
    contractStartDate?: string;
    contractEndDate?: string;
    paymentDeadline: string;
    approvedAt?: string;
    paymentConfirmedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateContractInput {
    applicationId: number;
    initialWorkDate: string;
    workDays: number;
    dailyWage: number;
    workHours?: string;
}

export const contractsAPI = {
    // 正式オファーを送信（契約を作成） - 薬局のみ
    create: async (input: CreateContractInput) => {
        return apiClient.post<APIResponse<Contract>>('/contracts', input);
    },

    // オファーを承認 - 薬剤師のみ
    approve: async (contractId: number, pharmacistId: number) => {
        return apiClient.post<APIResponse<Contract>>(`/contracts/${contractId}/approve`, {
            pharmacistId,
        });
    },

    // オファーを辞退 - 薬剤師のみ
    reject: async (contractId: number, pharmacistId: number) => {
        return apiClient.post<APIResponse>(`/contracts/${contractId}/reject`, {
            pharmacistId,
        });
    },

    // 契約一覧を取得（薬局側）
    getByPharmacy: async (pharmacyId: number, status?: string) => {
        const url = status
            ? `/contracts/pharmacy/${pharmacyId}?status=${status}`
            : `/contracts/pharmacy/${pharmacyId}`;
        return apiClient.get<APIResponse<Contract[]>>(url);
    },

    // 契約一覧を取得（薬剤師側）
    getByPharmacist: async (pharmacistId: number, status?: string) => {
        const url = status
            ? `/contracts/pharmacist/${pharmacistId}?status=${status}`
            : `/contracts/pharmacist/${pharmacistId}`;
        return apiClient.get<APIResponse<Contract[]>>(url);
    },

    // 契約詳細を取得
    getById: async (contractId: number) => {
        return apiClient.get<APIResponse<Contract>>(`/contracts/${contractId}`);
    },

    // 応募IDから契約を取得
    getByApplicationId: async (applicationId: number) => {
        return apiClient.get<APIResponse<Contract | null>>(`/contracts/application/${applicationId}`);
    },
};

