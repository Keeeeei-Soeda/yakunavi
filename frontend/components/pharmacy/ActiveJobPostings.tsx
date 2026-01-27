'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { MapPin, Calendar, Users, DollarSign } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { pharmacyAPI } from '@/lib/api/pharmacy';
import { JobPosting } from '@/lib/types';

interface ActiveJobPostingsProps {
  pharmacyId: number;
}

export const ActiveJobPostings: React.FC<ActiveJobPostingsProps> = ({
  pharmacyId,
}) => {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        setLoading(true);
        const response = await pharmacyAPI.getActiveJobPostings(pharmacyId);
        if (response.success && response.data) {
          setJobPostings(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch job postings:', err);
        setError('求人データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchJobPostings();
  }, [pharmacyId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">アクティブ求人</h3>
        <LoadingSpinner className="py-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">アクティブ求人</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">アクティブ求人</h3>
        <a
          href="/pharmacy/job-postings"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          すべて見る →
        </a>
      </div>

      {jobPostings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            アクティブな求人がありません
          </p>
          <a
            href="/pharmacy/job-postings/new"
            className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            求人を作成
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {jobPostings.map((job) => (
            <div
              key={job.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-gray-900 flex-1">
                  {job.title}
                </h4>
                <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded-full ml-2">
                  公開中
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span className="truncate">{job.workLocation}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign size={14} />
                  <span>日給: ¥{job.dailyWage.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>
                    締切:{' '}
                    {format(new Date(job.recruitmentDeadline), 'MM/dd', {
                      locale: ja,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>
                    応募数: {job._count?.applications || job.applicationCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

