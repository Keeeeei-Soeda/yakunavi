'use client';

import React, { useEffect, useState, forwardRef } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { favoritesAPI, FavoriteJobItem } from '@/lib/api/favorites';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface FavoriteJobsProps {
  refreshKey?: number;
}

export const FavoriteJobs = forwardRef<HTMLDivElement, FavoriteJobsProps>(
  ({ refreshKey }, ref) => {
    const [favorites, setFavorites] = useState<FavoriteJobItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      fetchFavorites();
    }, [refreshKey]);

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await favoritesAPI.getFavorites();
        if (response.success && response.data) {
          setFavorites(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
        setError('お気に入りの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    const handleRemoveFavorite = async (e: React.MouseEvent, jobPostingId: number) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await favoritesAPI.removeFavorite(jobPostingId);
        setFavorites((prev) => prev.filter((f) => f.jobPostingId !== jobPostingId));
      } catch (err) {
        console.error('Failed to remove favorite:', err);
      }
    };

    if (loading) {
      return (
        <div ref={ref} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Heart size={20} className="text-red-500" />
            お気に入り求人
          </h3>
          <LoadingSpinner className="py-8" />
        </div>
      );
    }

    if (error) {
      return (
        <div ref={ref} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Heart size={20} className="text-red-500" />
            お気に入り求人
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Heart size={20} className="text-red-500 fill-red-500" />
            お気に入り求人
            <span className="text-sm font-normal text-gray-500">（{favorites.length}件）</span>
          </h3>
          {favorites.length > 0 && (
            <Link
              href="/pharmacist/jobs"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              求人を探す →
            </Link>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-8">
            <Heart size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm mb-3">お気に入りに登録した求人がありません</p>
            <Link
              href="/pharmacist/jobs"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              求人を探す
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((fav) => {
              const isExpired = fav.jobPosting.status !== 'published';

              return (
                <Link
                  key={fav.id}
                  href={`/pharmacist/jobs/${fav.jobPosting.id}`}
                  className={`block border rounded-lg p-4 transition-colors hover:bg-gray-50 ${
                    isExpired ? 'border-gray-200 opacity-60' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isExpired && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle size={12} />
                            募集停止中
                          </span>
                        )}
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {fav.jobPosting.title}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {fav.jobPosting.pharmacy.pharmacyName || fav.jobPosting.pharmacy.companyName}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {fav.jobPosting.workLocation}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {fav.jobPosting.desiredWorkDays}日間
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-green-600">
                          <DollarSign size={12} />
                          日給 ¥{fav.jobPosting.dailyWage.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleRemoveFavorite(e, fav.jobPostingId)}
                      className="shrink-0 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                      title="お気に入りを解除"
                    >
                      <Heart size={18} className="text-red-500 fill-red-500" />
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

FavoriteJobs.displayName = 'FavoriteJobs';
