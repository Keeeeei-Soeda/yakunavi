'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileCheck,
  FileText,
  CreditCard,
  AlertTriangle,
  Briefcase,
  Menu,
  X,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'ダッシュボード',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/admin/dashboard',
    },
    {
      id: 'pharmacists',
      label: '薬剤師管理',
      icon: <Users className="w-5 h-5" />,
      path: '/admin/pharmacists',
    },
    {
      id: 'pharmacies',
      label: '薬局管理',
      icon: <Building2 className="w-5 h-5" />,
      path: '/admin/pharmacies',
    },
    {
      id: 'certificates',
      label: '証明書管理',
      icon: <FileCheck className="w-5 h-5" />,
      path: '/admin/certificates',
    },
    {
      id: 'contracts',
      label: '契約管理',
      icon: <FileText className="w-5 h-5" />,
      path: '/admin/contracts',
    },
    {
      id: 'job-postings',
      label: '求人管理',
      icon: <Briefcase className="w-5 h-5" />,
      path: '/admin/job-postings',
    },
    {
      id: 'payments',
      label: '支払い管理',
      icon: <CreditCard className="w-5 h-5" />,
      path: '/admin/payments',
    },
    {
      id: 'penalties',
      label: 'ペナルティ管理',
      icon: <AlertTriangle className="w-5 h-5" />,
      path: '/admin/penalties',
    },
  ];

  const handleMenuClick = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      {/* モバイルメニューボタン */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">管理者パネル</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* サイドバー */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          w-64 pt-16 lg:pt-0
        `}
      >
        <div className="h-full overflow-y-auto">
          {/* ロゴ・タイトル */}
          <div className="p-6 border-b border-gray-200 hidden lg:block">
            <h2 className="text-xl font-bold text-gray-900">薬ナビ管理システム</h2>
            <p className="text-sm text-gray-600 mt-1">管理者パネル</p>
          </div>

          {/* メニューリスト */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${
                    isActive(item.path)
                      ? 'bg-purple-50 text-purple-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <span
                  className={
                    isActive(item.path) ? 'text-purple-600' : 'text-gray-500'
                  }
                >
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* モバイルオーバーレイ */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

