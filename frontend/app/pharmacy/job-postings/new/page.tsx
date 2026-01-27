'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { JobPostingForm } from '@/components/pharmacy/JobPostingForm';
import { useAuthStore } from '@/lib/store/authStore';
import { jobPostingsAPI } from '@/lib/api/jobPostings';

export default function NewJobPostingPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const pharmacyId = user?.relatedId || 1;

  const handleSubmit = async (data: any, status: 'draft' | 'published') => {
    try {
      // 常に公開状態で作成
      const response = await jobPostingsAPI.create({ ...data, status: 'published' });
      if (response.success) {
        alert('求人を公開しました');
        router.push('/pharmacy/job-postings');
      }
    } catch (error: any) {
      console.error('Create error:', error);
      alert(error.response?.data?.error || '求人の作成に失敗しました');
    }
  };

  return (
    <ProtectedRoute requiredUserType="pharmacy">
      <PharmacyLayout title="新規求人投稿">
        <JobPostingForm
          pharmacyId={pharmacyId}
          onSubmit={handleSubmit}
          submitLabel="作成"
        />
      </PharmacyLayout>
    </ProtectedRoute>
  );
}

