// ユーザータイプ
export type UserType = 'pharmacy' | 'pharmacist' | 'admin';

// 認証
export interface User {
  id: number;
  email: string;
  userType: UserType;
}

// ダッシュボード統計
export interface PharmacyDashboardStats {
  activeJobPostings: number;
  totalApplications: number;
  activeContracts: number;
  pendingContracts: number;
}

export interface PharmacistDashboardStats {
  activeApplications: number;
  activeContracts: number;
  unreadMessages: number;
}

// 薬局
export interface Pharmacy {
  id: number;
  userId: number;
  pharmacyName: string;
  representativeLastName: string;
  representativeFirstName: string;
  phoneNumber?: string;
  prefecture?: string;
  address?: string;
  nearestStation?: string;
  introduction?: string;
}

// 薬剤師
export interface Pharmacist {
  id: number;
  userId: number;
  lastName: string;
  firstName: string;
  phoneNumber?: string;
  age?: number;
  workExperienceYears?: number;
  verificationStatus: string;
}

// 求人
export interface JobPosting {
  id: number;
  pharmacyId: number;
  title: string;
  description?: string;
  workLocation: string;
  desiredWorkDays: number;
  workStartPeriodFrom: string;
  workStartPeriodTo: string;
  recruitmentDeadline: string;
  dailyWage: number;
  totalCompensation: number;
  status: string;
  viewCount: number;
  applicationCount: number;
  publishedAt?: string;
  pharmacy?: {
    pharmacyName: string;
  };
  _count?: {
    applications: number;
  };
}

// 応募
export interface Application {
  id: number;
  jobPostingId: number;
  pharmacistId: number;
  status: string;
  coverLetter?: string;
  appliedAt: string;
  jobPosting: {
    id: number;
    title: string;
    workLocation?: string;
    dailyWage?: number;
    desiredWorkDays?: number;
    pharmacy?: {
      pharmacyName: string;
    };
  };
  pharmacist?: {
    id: number;
    lastName: string;
    firstName: string;
    age?: number;
    workExperienceYears?: number;
  };
}

// 契約
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
  status: string;
  pharmacy?: {
    pharmacyName: string;
  };
  jobPosting?: {
    title: string;
  };
}

// 通知
export interface Notification {
  id: number;
  userId: number;
  notificationType: string;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// APIレスポンス
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

