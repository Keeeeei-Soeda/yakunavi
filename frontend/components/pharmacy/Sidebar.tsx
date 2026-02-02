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
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { pharmacyAPI, PharmacyProfile } from '@/lib/api/pharmacy';

const menuItems = [
    {
        icon: Home,
        label: 'ホーム',
        href: '/pharmacy/dashboard',
    },
    {
        icon: Users,
        label: '応募確認',
        href: '/pharmacy/applications',
    },
    {
        icon: MessageSquare,
        label: 'メッセージ管理',
        href: '/pharmacy/messages',
    },
    {
        icon: Briefcase,
        label: '求人票',
        href: '/pharmacy/job-postings',
    },
    {
        icon: FileText,
        label: '契約管理',
        href: '/pharmacy/contracts',
    },
    {
        icon: CreditCard,
        label: '請求書管理',
        href: '/pharmacy/payments',
    },
    {
        icon: User,
        label: 'プロフィール管理',
        href: '/pharmacy/profile',
    },
    {
        icon: UserCircle,
        label: '採用薬剤師のプロフィール',
        href: '/pharmacy/pharmacist-profiles',
    },
];

export const PharmacySidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const pharmacyId = user?.relatedId || 1;
  
  const [pharmacyProfile, setPharmacyProfile] = useState<PharmacyProfile | null>(null);

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

  const handleLogout = () => {
    logout();
    router.push('/pharmacy/login');
  };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
            {/* ヘッダー */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">薬局管理システム</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {pharmacyProfile?.pharmacyName || '読み込み中...'}
                </p>
            </div>

            {/* メニュー */}
            <nav className="flex-1 p-4">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${isActive
                                            ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
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
};

