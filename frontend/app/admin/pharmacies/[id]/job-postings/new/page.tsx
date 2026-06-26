'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { JobPostingForm } from '@/components/pharmacy/JobPostingForm';
import {
  createJobPostingForPharmacy,
  getPharmacyBranches,
  publishJobPostingForPharmacy,
} from '@/lib/api/admin';
import { CreateJobPostingInput } from '@/lib/api/jobPostings';

export default function AdminNewJobPostingPage() {
  const params = useParams();
  const router = useRouter();
  const pharmacyId = Number(params.id);

  const [pharmacyName, setPharmacyName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacy = async () => {
      try {
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
      } catch (error) {
        console.error('Failed to fetch pharmacy:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacy();
  }, [pharmacyId]);

  const branchLoader = useCallback(async (id: number) => {
    const response = await getPharmacyBranches(id);
    return response.data ?? [];
  }, []);

  const handleSubmit = async (data: CreateJobPostingInput, status: 'draft' | 'published') => {
    try {
      const response = await createJobPostingForPharmacy(pharmacyId, {
        ...data,
        status,
      });
      if (response.success) {
        if (status === 'published' && response.data?.status !== 'published') {
          await publishJobPostingForPharmacy(response.data.id);
        }
        alert('おためし案件を公開しました');
        router.push(`/admin/pharmacies/${pharmacyId}`);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      console.error('Create error:', error);
      alert(err.response?.data?.error || 'おためし案件の作成に失敗しました');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">読み込み中...</p>
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

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">おためし案件の代行登録</h1>
        <p className="mt-1 text-sm text-gray-600">
          対象薬局: {pharmacyName || `薬局ID #${pharmacyId}`}
        </p>
      </div>

      <JobPostingForm
        pharmacyId={pharmacyId}
        onSubmit={handleSubmit}
        submitLabel="公開する"
        branchLoader={branchLoader}
      />
    </div>
  );
}
