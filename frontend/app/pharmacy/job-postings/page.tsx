'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { useAuthStore } from '@/lib/store/authStore';
import { jobPostingsAPI, JobPosting } from '@/lib/api/jobPostings';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function JobPostingsPage() {
  const user = useAuthStore((state) => state.user);
  const pharmacyId = user?.relatedId || 1;

  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobPostings();
  }, [pharmacyId]);

  const fetchJobPostings = async () => {
    setLoading(true);
    try {
      const response = await jobPostingsAPI.getByPharmacy(pharmacyId);
      if (response.success && response.data) {
        setJobPostings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch job postings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await jobPostingsAPI.publish(id);
      alert('求人を公開しました');
      fetchJobPostings();
    } catch (error) {
      console.error('Failed to publish:', error);
      alert('公開に失敗しました');
    }
  };


  const handleDelete = async (id: number) => {
    if (!confirm('この求人を削除しますか？')) return;

    try {
      await jobPostingsAPI.delete(id);
      alert('求人を削除しました');
      fetchJobPostings();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('削除に失敗しました');
    }
  };

  return (
    <ProtectedRoute requiredUserType="pharmacy">
      <PharmacyLayout
        title="求人投稿管理"
        rightAction={
          <Link
            href="/pharmacy/job-postings/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            新規投稿
          </Link>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : jobPostings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">まだ求人が投稿されていません</p>
            <Link
              href="/pharmacy/job-postings/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              最初の求人を投稿
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobPostings.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${job.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {job.status === 'published' ? '公開中' : '下書き'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        📍 {job.workLocation}
                      </p>
                      <p>💰 日給: ¥{job.dailyWage.toLocaleString()}</p>
                      {job.desiredWorkDays && (
                        <p>📅 勤務日数: {job.desiredWorkDays}日</p>
                      )}
                      {job.desiredWorkHours && (
                        <p>⏰ {job.desiredWorkHours}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        作成日: {format(new Date(job.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {job.status === 'draft' ? (
                      <button
                        onClick={() => handlePublish(job.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="公開"
                      >
                        <Eye size={20} />
                      </button>
                    ) : (
                      <Link
                        href={`/pharmacy/job-postings/${job.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="詳細を見る"
                      >
                        <Eye size={20} />
                      </Link>
                    )}
                    <Link
                      href={`/pharmacy/job-postings/${job.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="編集"
                    >
                      <Edit size={20} />
                    </Link>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="削除"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PharmacyLayout>
    </ProtectedRoute>
  );
}
