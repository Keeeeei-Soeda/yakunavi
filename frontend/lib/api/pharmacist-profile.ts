import { apiClient } from './client';
import { APIResponse } from '../types';

export interface PharmacistProfile {
  id: number;
  userId: number;
  // 基本情報
  lastName: string;
  firstName: string;
  phoneNumber?: string;
  address?: string;
  birthDate?: string;
  age?: number;
  nearestStation?: string;

  // 学歴
  university?: string;
  graduationYear?: number;

  // 資格情報
  licenseNumber?: string;
  licenseYear?: number;
  certifiedPharmacistLicense?: string;
  otherLicenses?: string;

  // 経歴
  workExperienceYears?: number;
  workExperienceMonths?: number;
  workExperienceTypes?: string[];
  mainDuties?: string[];

  // スキル・専門分野
  specialtyAreas?: string[];
  pharmacySystems?: string[];
  specialNotes?: string;

  // 自己紹介
  selfIntroduction?: string;

  // 証明書確認ステータス
  verificationStatus?: string;
  verifiedAt?: string;
}

export interface Certificate {
  id: number;
  pharmacistId: number;
  certificateType: string;
  filePath: string;
  fileName: string;
  uploadedAt: string;
  verificationStatus: string;
}

export const pharmacistProfileAPI = {
  // プロフィール取得
  getProfile: async (pharmacistId: number) => {
    return apiClient.get<APIResponse<PharmacistProfile>>(
      `/pharmacist/profile/${pharmacistId}`
    );
  },

  // プロフィール更新
  updateProfile: async (pharmacistId: number, data: Partial<PharmacistProfile>) => {
    return apiClient.put<APIResponse<PharmacistProfile>>(
      `/pharmacist/profile/${pharmacistId}`,
      data
    );
  },

  // 証明書アップロード
  uploadCertificate: async (
    pharmacistId: number,
    certificateType: 'license' | 'registration',
    file: File
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('certificateType', certificateType);

    return apiClient.post<APIResponse<Certificate>>(
      `/pharmacist/profile/${pharmacistId}/certificates`,
      formData
    );
  },

  // 証明書一覧取得
  getCertificates: async (pharmacistId: number) => {
    return apiClient.get<APIResponse<Certificate[]>>(
      `/pharmacist/profile/${pharmacistId}/certificates`
    );
  },

  // 証明書削除
  deleteCertificate: async (pharmacistId: number, certificateId: number) => {
    return apiClient.delete<APIResponse>(
      `/pharmacist/profile/${pharmacistId}/certificates/${certificateId}`
    );
  },

  // 証明書確認ステータス取得
  getVerificationStatus: async (pharmacistId: number) => {
    return apiClient.get<APIResponse<any>>(
      `/pharmacist/profile/${pharmacistId}/verification-status`
    );
  },
};

