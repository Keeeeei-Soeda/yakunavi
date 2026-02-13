'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Search,
  Briefcase,
  FileText,
  User,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { pharmacistProfileAPI } from '@/lib/api/pharmacist-profile';

export const PharmacistSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const pharmacistId = user?.relatedId;
  const [pharmacistName, setPharmacistName] = useState<string>('');

  useEffect(() => {
    if (pharmacistId) {
      fetchPharmacistName();
    }
  }, [pharmacistId]);

  const fetchPharmacistName = async () => {
    try {
      const response = await pharmacistProfileAPI.getProfile(pharmacistId!);
      if (response.success && response.data) {
        const { lastName, firstName } = response.data;
        setPharmacistName(`${lastName} ${firstName}`);
      }
    } catch (error) {
      console.error('Failed to fetch pharmacist name:', error);
      // エラー時はデフォルト表示を維持
      setPharmacistName('');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/pharmacist/login');
  };

  const menuItems = [
    {
      icon: Home,
      label: 'ダッシュボード',
      href: '/pharmacist/dashboard',
    },
    {
      icon: Search,
      label: '求人検索',
      href: '/pharmacist/jobs',
    },
    {
      icon: Briefcase,
      label: '応募管理',
      href: '/pharmacist/applications',
    },
    {
      icon: MessageSquare,
      label: 'メッセージ',
      href: '/pharmacist/messages',
    },
    {
      icon: FileText,
      label: '契約管理',
      href: '/pharmacist/contracts',
    },
    {
      icon: User,
      label: 'プロフィール',
      href: '/pharmacist/profile',
    },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 flex flex-col">
      {/* ロゴ・ヘッダー */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">薬剤師管理</h1>
        <p className="text-sm text-gray-500 mt-1">
          {pharmacistName || 'Yaku Navi'}
        </p>
      </div>

      {/* メニュー */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* フッター */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span>ログアウト</span>
        </button>
      </div>
    </aside>
  );
};

