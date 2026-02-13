import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Axios インスタンスを作成
const adminApi = axios.create({
    baseURL: `${API_URL}/admin`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// リクエストインターセプター（トークンを自動付与）
adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ダッシュボード統計
export const getDashboardStats = async () => {
    const response = await adminApi.get('/dashboard/stats');
    return response.data;
};

// 資格証明書管理
export const getCertificates = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}) => {
    const response = await adminApi.get('/certificates', { params });
    return response.data;
};

export const approveCertificate = async (certificateId: number, comment?: string) => {
    const response = await adminApi.post(`/certificates/${certificateId}/approve`, { comment });
    return response.data;
};

export const rejectCertificate = async (certificateId: number, reason: string) => {
  const response = await adminApi.post(`/certificates/${certificateId}/reject`, { reason });
  return response.data;
};

export const getCertificateFile = async (certificateId: number): Promise<Blob> => {
  const response = await adminApi.get(`/certificates/${certificateId}/file`, {
    responseType: 'blob',
  });
  return response.data;
};

// 契約管理
export const getContracts = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
}) => {
    const response = await adminApi.get('/contracts', { params });
    return response.data;
};

// 支払い管理
export const getPayments = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}) => {
    const response = await adminApi.get('/payments', { params });
    return response.data;
};

export const confirmPayment = async (paymentId: number) => {
    const response = await adminApi.post(`/payments/${paymentId}/confirm`);
    return response.data;
};

// ペナルティ管理
export const getPenalties = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}) => {
    const response = await adminApi.get('/penalties', { params });
    return response.data;
};

export const resolvePenalty = async (penaltyId: number, resolutionNote?: string) => {
    const response = await adminApi.post(`/penalties/${penaltyId}/resolve`, { resolutionNote });
    return response.data;
};

// 統計・レポート
export const getStatistics = async (startDate?: string, endDate?: string) => {
    const response = await adminApi.get('/statistics', {
        params: { startDate, endDate },
    });
    return response.data;
};

// 求人管理
export const getJobPostings = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}) => {
    const response = await adminApi.get('/job-postings', { params });
    return response.data;
};

// 応募管理
export const getApplications = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}) => {
    const response = await adminApi.get('/applications', { params });
    return response.data;
};

// ユーザー管理
export const getPharmacists = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}) => {
    const response = await adminApi.get('/pharmacists', { params });
    return response.data;
};

export const getPharmacies = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}) => {
    const response = await adminApi.get('/pharmacies', { params });
    return response.data;
};

export const toggleUserStatus = async (userId: number, isActive: boolean) => {
    const response = await adminApi.patch(`/users/${userId}/status`, { isActive });
    return response.data;
};

