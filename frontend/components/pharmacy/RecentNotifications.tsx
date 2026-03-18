'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Bell } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { pharmacyAPI } from '@/lib/api/pharmacy';
import { Notification } from '@/lib/types';

export const PharmacyRecentNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await pharmacyAPI.getRecentNotifications();
        if (response.success && response.data) {
          setNotifications(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch pharmacy notifications:', err);
        setError('通知の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">最近の通知</h3>
        <LoadingSpinner className="py-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">最近の通知</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">最近の通知</h3>
        <a
          href="/pharmacy/notifications"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          すべて見る →
        </a>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          新しい通知はありません
        </p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition-colors ${
                notification.isRead
                  ? 'border-gray-200 bg-white'
                  : 'border-blue-200 bg-blue-50'
              } hover:bg-gray-50`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Bell size={20} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {format(new Date(notification.createdAt), 'MM月dd日 HH:mm', {
                      locale: ja,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
