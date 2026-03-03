'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacistLayout } from '@/components/pharmacist/Layout';
import { jobPostingsAPI, JobPosting } from '@/lib/api/jobPostings';
import { applicationsAPI } from '@/lib/api/applications';
import { favoritesAPI } from '@/lib/api/favorites';
import { useAuthStore } from '@/lib/store/authStore';
import { PREFECTURES } from '@/lib/constants/prefectures';
import { Search, MapPin, Clock, DollarSign, Send, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function JobSearchPage() {
  const user = useAuthStore((state) => state.user);
  const pharmacistId = user?.relatedId || 1;

  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<number | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [togglingFavorite, setTogglingFavorite] = useState<number | null>(null);

  // フィルター
  const [filters, setFilters] = useState({
    prefecture: '',
    minWage: '',
    maxWage: '',
    keyword: '',
  });

  useEffect(() => {
    searchJobs();
    loadFavoriteIds();
  }, []);

  const loadFavoriteIds = async () => {
    try {
      const response = await favoritesAPI.getFavorites();
      if (response.success && response.data) {
        setFavoriteIds(new Set(response.data.map((f) => f.jobPostingId)));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, jobId: number) => {
    e.stopPropagation();
    if (togglingFavorite === jobId) return;
    setTogglingFavorite(jobId);
    try {
      if (favoriteIds.has(jobId)) {
        await favoritesAPI.removeFavorite(jobId);
        setFavoriteIds((prev) => { const next = new Set(prev); next.delete(jobId); return next; });
      } else {
        await favoritesAPI.addFavorite(jobId);
        setFavoriteIds((prev) => new Set(prev).add(jobId));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setTogglingFavorite(null);
    }
  };

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
    // 詳細画面に遷移して応募フォームを表示
    window.location.href = `/pharmacist/jobs/${jobPostingId}`;
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
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <button
                      onClick={(e) => handleToggleFavorite(e, job.id)}
                      disabled={togglingFavorite === job.id}
                      className={`p-2 rounded-full border transition-colors ${
                        favoriteIds.has(job.id)
                          ? 'border-red-300 bg-red-50 text-red-500 hover:bg-red-100'
                          : 'border-gray-300 bg-white text-gray-400 hover:border-red-300 hover:text-red-400'
                      } disabled:opacity-50`}
                      title={favoriteIds.has(job.id) ? 'お気に入りを解除' : 'お気に入りに追加'}
                    >
                      <Heart
                        size={18}
                        className={favoriteIds.has(job.id) ? 'fill-red-500' : ''}
                      />
                    </button>
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applying === job.id}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                    >
                      <Send size={18} />
                      {applying === job.id ? '応募中...' : '詳細を見る'}
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

