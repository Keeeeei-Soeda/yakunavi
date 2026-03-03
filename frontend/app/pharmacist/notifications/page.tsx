'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Bell,
  FileText,
  CheckCircle,
  Calendar,
  ChevronRight,
  CheckCheck,
} from 'lucide-react';
import { pharmacistAPI } from '@/lib/api/pharmacist';
import { Notification } from '@/lib/types';

const NOTIFICATION_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  offer_received: {
    label: '正式オファー',
    icon: <FileText size={18} />,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
  contract_activated: {
    label: '契約成立',
    icon: <CheckCircle size={18} />,
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  date_proposal: {
    label: '候補日提案',
    icon: <Calendar size={18} />,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
};

function getConfig(type: string) {
  return (
    NOTIFICATION_TYPE_CONFIG[type] ?? {
      label: '通知',
      icon: <Bell size={18} />,
      color: 'text-gray-600',
      bg: 'bg-gray-100',
    }
  );
}

export default function PharmacistNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await pharmacistAPI.getAllNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await pharmacistAPI.markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      } catch (err) {
        console.error(err);
      }
    }
    if (notification.linkUrl) {
      router.push(notification.linkUrl);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await pharmacistAPI.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={22} className="text-green-600" />
            <h1 className="text-lg font-bold text-gray-900">通知</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
            >
              <CheckCheck size={16} />
              すべて既読にする
            </button>
          )}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">通知はありません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const config = getConfig(notification.notificationType);
              return (
                <button
                  key={notification.id}
                  onClick={() => handleClick(notification)}
                  className={`w-full text-left bg-white rounded-xl shadow-sm border transition-all active:scale-[0.99] hover:shadow-md ${
                    notification.isRead
                      ? 'border-gray-100'
                      : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-start gap-3 p-4">
                    {/* アイコン */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg} ${config.color}`}
                    >
                      {config.icon}
                    </div>

                    {/* テキスト */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-semibold ${config.color}`}>
                            {config.label}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {format(new Date(notification.createdAt), 'MM/dd HH:mm', {
                            locale: ja,
                          })}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm mt-0.5">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>

                    {/* 矢印（リンクあり） */}
                    {notification.linkUrl && (
                      <ChevronRight size={18} className="text-gray-400 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
