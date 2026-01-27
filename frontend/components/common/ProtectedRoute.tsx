'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { LoadingSpinner } from './LoadingSpinner';
import { UserType } from '@/lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: UserType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredUserType,
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (requiredUserType && user?.userType !== requiredUserType) {
        // ユーザータイプが一致しない場合、適切なダッシュボードにリダイレクト
        if (user?.userType === 'pharmacy') {
          router.push('/pharmacy/dashboard');
        } else if (user?.userType === 'pharmacist') {
          router.push('/pharmacist/dashboard');
        } else if (user?.userType === 'admin') {
          router.push('/admin/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, requiredUserType, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredUserType && user?.userType !== requiredUserType) {
    return null;
  }

  return <>{children}</>;
};

