'use client';

import React, { useState, useEffect } from 'react';
import { PharmacistSidebar } from './Sidebar';
import { Menu } from 'lucide-react';

interface PharmacistLayoutProps {
  children: React.ReactNode;
  title?: string;
  rightAction?: React.ReactNode;
  hideSidebar?: boolean;
  offerNotification?: React.ReactNode;
}

export const PharmacistLayout: React.FC<PharmacistLayoutProps> = ({
  children,
  title,
  rightAction,
  hideSidebar = false,
  offerNotification,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {!hideSidebar && (
        <PharmacistSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          isMobile={isMobile}
        />
      )}
      <div
        className={`flex-1 ${
          hideSidebar
            ? 'w-full'
            : isMobile
            ? 'ml-0'
            : 'ml-64'
        }`}
      >
        {/* ヘッダー（hideSidebarがtrueの場合は非表示） */}
        {!hideSidebar && title && (
          <header className="bg-white shadow-sm sticky top-0 z-20">
            <div className="px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  {/* モバイル用ハンバーガーメニューボタン */}
                  {isMobile && (
                    <button
                      onClick={() => setIsMobileMenuOpen(true)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="メニューを開く"
                    >
                      <Menu size={20} />
                    </button>
                  )}
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                    {title}
                  </h1>
                  {offerNotification && <div>{offerNotification}</div>}
                </div>
                {rightAction && (
                  <div className="flex items-center gap-2 md:gap-4">
                    {rightAction}
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* メインコンテンツ */}
        <main className={hideSidebar ? '' : 'p-4 md:p-6'}>{children}</main>
      </div>
    </div>
  );
};

