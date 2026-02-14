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
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { pharmacistProfileAPI } from '@/lib/api/pharmacist-profile';

interface PharmacistSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export const PharmacistSidebar: React.FC<PharmacistSidebarProps> = ({
  isOpen = true,
  onClose,
  isMobile = false,
}) => {
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

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
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

  // デスクトップ表示（900px以上）
  if (!isMobile) {
    return (
      <aside className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 flex flex-col z-30">
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base ${isActive
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
  }

  // モバイル表示（900px未満）
  return (
    <>
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* サイドバー */}
          <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300">
            {/* ヘッダー（閉じるボタン付き） */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900">薬剤師管理</h1>
                <p className="text-xs text-gray-500 mt-1">
                  {pharmacistName || 'Yaku Navi'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* メニュー */}
            <nav className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${isActive
                          ? 'bg-green-50 text-green-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* フッター */}
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => {
                  handleLogout();
                  if (onClose) onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                <span>ログアウト</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

