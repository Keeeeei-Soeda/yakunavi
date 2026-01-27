// ユーザータイプ
export type UserType = 'pharmacy' | 'pharmacist' | 'admin';

// JWTペイロード
export interface JWTPayload {
  id: number;
  email: string;
  userType: UserType;
}

// APIレスポンス
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// ページネーション
export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  links: {
    first: string;
    last: string;
    next: string | null;
    prev: string | null;
  };
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

// 求人検索フィルター
export interface JobSearchFilters {
  prefecture?: string;
  minWage?: number;
  maxWage?: number;
  status?: string;
  page?: number;
  perPage?: number;
}

