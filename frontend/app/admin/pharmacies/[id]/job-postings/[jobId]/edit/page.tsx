'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, EyeOff } from 'lucide-react';
import { JobPostingForm } from '@/components/pharmacy/JobPostingForm';
import { JobPosting } from '@/lib/api/jobPostings';
import { CreateJobPostingInput } from '@/lib/api/jobPostings';
import {
  getJobPostingById,
  getPharmacyBranches,
  updateJobPostingForPharmacy,
  publishJobPostingForPharmacy,
  unpublishJobPostingForPharmacy,
  deleteJobPostingForPharmacy,
} from '@/lib/api/admin';

export default function AdminEditJobPostingPage() {
  const params = useParams();
  const router = useRouter();
  const pharmacyId = Number(params.id);
  const jobId = Number(params.jobId);

  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null);
  const [pharmacyName, setPharmacyName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [jobId, pharmacyId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobResponse] = await Promise.all([
        getJobPostingById(jobId),
        (async () => {
          const token = localStorage.getItem('token');
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/pharmacies/${pharmacyId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setPharmacyName(data.data.pharmacyName || data.data.companyName || '');
          }
        })(),
      ]);

      if (jobResponse.success && jobResponse.data) {
        setJobPosting(jobResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch job posting:', error);
      alert('おためし案件の取得に失敗しました');
      router.push(`/admin/pharmacies/${pharmacyId}`);
    } finally {
      setLoading(false);
    }
  };

  const branchLoader = useCallback(async (id: number) => {
    const response = await getPharmacyBranches(id);
    return response.data ?? [];
  }, []);

  const handleSubmit = async (data: CreateJobPostingInput, status: 'draft' | 'published') => {
    try {
      const updateData = { ...data, status: 'published' };
      const response = await updateJobPostingForPharmacy(jobId, updateData);
      if (response.success) {
        if (jobPosting?.status !== 'published') {
          await publishJobPostingForPharmacy(jobId);
          alert('おためし案件を更新して公開しました');
        } else {
          alert('おためし案件を更新しました');
        }
        router.push(`/admin/pharmacies/${pharmacyId}`);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      console.error('Update error:', error);
      alert(err.response?.data?.error || 'おためし案件の更新に失敗しました');
      throw error;
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('このおためし案件を非公開にしますか？')) return;
    try {
      await unpublishJobPostingForPharmacy(jobId);
      alert('おためし案件を非公開にしました');
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      alert(err.response?.data?.error || '非公開化に失敗しました');
    }
  };

  const handleDelete = async () => {
    if (!confirm('このおためし案件を削除しますか？\nこの操作は取り消せません。')) return;
    try {
      await deleteJobPostingForPharmacy(jobId);
      alert('おためし案件を削除しました');
      router.push(`/admin/pharmacies/${pharmacyId}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      alert(err.response?.data?.error || '削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (!jobPosting) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">おためし案件が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.push(`/admin/pharmacies/${pharmacyId}`)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        薬局詳細に戻る
      </button>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">おためし案件の代行編集</h1>
          <p className="mt-1 text-sm text-gray-600">
            対象薬局: {pharmacyName || `薬局ID #${pharmacyId}`} / 案件ID #{jobId}
          </p>
        </div>
        <div className="flex gap-2">
          {jobPosting.status === 'published' && (
            <button
              onClick={handleUnpublish}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              <EyeOff className="h-4 w-4" />
              非公開
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-red-300 rounded-md text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            削除
          </button>
        </div>
      </div>

      <JobPostingForm
        pharmacyId={pharmacyId}
        initialData={{
          pharmacyBranchId: jobPosting.pharmacyBranchId,
          title: jobPosting.title,
          description: jobPosting.description,
          workLocation: jobPosting.workLocation,
          dailyWage: jobPosting.dailyWage,
          desiredWorkDays: jobPosting.desiredWorkDays,
          workStartPeriodFrom: jobPosting.workStartPeriodFrom,
          workStartPeriodTo: jobPosting.workStartPeriodTo,
          requirements: jobPosting.requirements,
          desiredWorkHours: jobPosting.desiredWorkHours,
          totalCompensation: jobPosting.totalCompensation,
          platformFee: jobPosting.platformFee,
        }}
        onSubmit={handleSubmit}
        submitLabel="更新して公開"
        branchLoader={branchLoader}
      />
    </div>
  );
}
