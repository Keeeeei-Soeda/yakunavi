'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Users,
  MessageSquare,
  Briefcase,
  FileText,
  User,
  UserCircle,
  CreditCard,
  Settings,
  LogOut,
  X,
  BookOpen,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { pharmacyAPI, PharmacyProfile } from '@/lib/api/pharmacy';
import { messagesAPI } from '@/lib/api/messages';

const menuItems = [
    { icon: Home,        label: 'ホーム',               href: '/pharmacy/dashboard' },
    { icon: Users,       label: '応募確認',              href: '/pharmacy/applications' },
    { icon: MessageSquare, label: 'メッセージ管理',      href: '/pharmacy/messages' },
    { icon: Briefcase,   label: '求人票',                href: '/pharmacy/job-postings' },
    { icon: FileText,    label: '契約管理',              href: '/pharmacy/contracts' },
    { icon: CreditCard,  label: '請求書管理',            href: '/pharmacy/payments' },
    { icon: User,        label: 'プロフィール管理',      href: '/pharmacy/profile' },
    { icon: UserCircle,  label: '採用薬剤師のプロフィール', href: '/pharmacy/pharmacist-profiles' },
    { icon: BookOpen,    label: '使い方ガイド',          href: '/pharmacy/guide' },
];

interface PharmacySidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export const PharmacySidebar: React.FC<PharmacySidebarProps> = ({
  isOpen = true,
  onClose,
  isMobile = false,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const pharmacyId = user?.relatedId || 1;
  const [pharmacyProfile, setPharmacyProfile] = useState<PharmacyProfile | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await pharmacyAPI.getProfile(pharmacyId);
        if (response.success && response.data) {
          setPharmacyProfile(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch pharmacy profile:', error);
      }
    };
    fetchProfile();
  }, [pharmacyId]);

  const fetchUnreadCount = async () => {
    try {
      const response = await messagesAPI.getUnreadCount(pharmacyId);
      if (response.success && response.data) {
        setUnreadMessageCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread message count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const onFocus = () => fetchUnreadCount();
    window.addEventListener('focus', onFocus);
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [pharmacyId]);

  const handleLogout = () => {
    logout();
    router.push('/pharmacy/login');
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const displayName =
    pharmacyProfile?.pharmacyName || pharmacyProfile?.companyName || '読み込み中...';

  // ======== デスクトップ ========
  if (!isMobile) {
    return (
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-30 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">薬局管理システム</h1>
          <p className="text-sm text-gray-500 mt-1">{displayName}</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isMessages = item.href === '/pharmacy/messages';
              const badgeCount = isMessages ? unreadMessageCount : 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="flex-1">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-bold bg-red-500 text-white">
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200 space-y-1">
          <Link
            href="/pharmacy/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Settings size={20} />
            <span>設定</span>
          </Link>
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

  // ======== モバイル（ドロワー） ========
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
          <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900">薬局管理システム</h1>
                <p className="text-xs text-gray-500 mt-1">{displayName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isMessages = item.href === '/pharmacy/messages';
                  const badgeCount = isMessages ? unreadMessageCount : 0;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="flex-1">{item.label}</span>
                        {badgeCount > 0 && (
                          <span className="ml-auto inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-bold bg-red-500 text-white">
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="p-3 border-t border-gray-200 space-y-1">
              <Link
                href="/pharmacy/settings"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings size={18} />
                <span>設定</span>
              </Link>
              <button
                onClick={() => { handleLogout(); if (onClose) onClose(); }}
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
