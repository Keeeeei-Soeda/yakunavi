'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacistLayout } from '@/components/pharmacist/Layout';
import { jobPostingsAPI, JobPosting } from '@/lib/api/jobPostings';
import { applicationsAPI } from '@/lib/api/applications';
import { useAuthStore } from '@/lib/store/authStore';
import { PREFECTURES } from '@/lib/constants/prefectures';
import { Search, MapPin, Clock, DollarSign, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function JobSearchPage() {
  const user = useAuthStore((state) => state.user);
  const pharmacistId = user?.relatedId || 1;

  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<number | null>(null);

  // フィルター
  const [filters, setFilters] = useState({
    prefecture: '',
    minWage: '',
    maxWage: '',
    keyword: '',
  });

  useEffect(() => {
    searchJobs();
  }, []);

  const searchJobs = async () => {
    setLoading(true);
    try {
      const params: any = {
        status: 'published',
      };

      if (filters.prefecture) {
        params.prefecture = filters.prefecture;
      }
      if (filters.minWage) {
        params.minWage = Number(filters.minWage);
      }
      if (filters.maxWage) {
        params.maxWage = Number(filters.maxWage);
      }
      if (filters.keyword) {
        params.keyword = filters.keyword;
      }

      const response = await jobPostingsAPI.search(params);
      if (response.success && response.data) {
        setJobPostings(response.data);
      }
    } catch (error) {
      console.error('Failed to search jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobPostingId: number) => {
    // 応募確認ダイアログを表示
    const nearestStation = prompt('最寄駅を入力してください（例: 天王寺駅）');
    if (!nearestStation) {
      alert('最寄駅の入力が必要です');
      return;
    }

    const workExperienceTypesInput = prompt(
      '勤務経験のある業態を入力してください（カンマ区切り）\n例: 調剤薬局,ドラッグストア'
    );
    if (!workExperienceTypesInput) {
      alert('勤務経験のある業態を最低1つ入力してください');
      return;
    }

    const workExperienceTypes = workExperienceTypesInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);

    const coverLetter = prompt('自己紹介（任意）\n100〜300文字程度');

    if (!confirm('この内容で応募しますか？')) return;

    setApplying(jobPostingId);
    try {
      const response = await applicationsAPI.create({
        jobPostingId,
        pharmacistId,
        coverLetter: coverLetter || undefined,
        nearestStation,
        workExperienceTypes,
      });
      if (response.success) {
        alert('応募を送信しました');
        searchJobs();
      }
    } catch (error: any) {
      console.error('Failed to apply:', error);
      alert(error.response?.data?.error || '応募に失敗しました');
    } finally {
      setApplying(null);
    }
  };

  return (
    <ProtectedRoute requiredUserType="pharmacist">
      <PharmacistLayout title="求人検索">
        {/* 検索フィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">検索条件</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                都道府県
              </label>
              <select
                value={filters.prefecture}
                onChange={(e) =>
                  setFilters({ ...filters, prefecture: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">すべて</option>
                {PREFECTURES.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最低日給
              </label>
              <input
                type="number"
                value={filters.minWage}
                onChange={(e) =>
                  setFilters({ ...filters, minWage: e.target.value })
                }
                placeholder="例: 50000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最高日給
              </label>
              <input
                type="number"
                value={filters.maxWage}
                onChange={(e) =>
                  setFilters({ ...filters, maxWage: e.target.value })
                }
                placeholder="例: 100000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                キーワード
              </label>
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) =>
                  setFilters({ ...filters, keyword: e.target.value })
                }
                placeholder="求人タイトル、内容で検索"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <button
            onClick={searchJobs}
            disabled={loading}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
          >
            <Search size={20} />
            {loading ? '検索中...' : '検索'}
          </button>
        </div>

        {/* 求人一覧 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : jobPostings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">条件に一致する求人が見つかりませんでした</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobPostings.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {job.title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{job.workLocation}</span>
                      </div>
                      {job.desiredWorkDays && (
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>勤務日数: {job.desiredWorkDays}日</span>
                        </div>
                      )}
                      {job.desiredWorkHours && (
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>{job.desiredWorkHours}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} />
                        <span className="font-semibold text-green-600">
                          日給: ¥{job.dailyWage.toLocaleString()}
                        </span>
                        {job.totalCompensation && (
                          <span className="text-gray-500">
                            （報酬総額: ¥{job.totalCompensation.toLocaleString()}）
                          </span>
                        )}
                      </div>
                      {job.description && (
                        <p className="mt-3 text-gray-700 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applying === job.id}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                    >
                      <Send size={18} />
                      {applying === job.id ? '応募中...' : '応募する'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PharmacistLayout>
    </ProtectedRoute>
  );
}

