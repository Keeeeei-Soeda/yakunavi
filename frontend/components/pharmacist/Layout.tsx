'use client';

import React from 'react';
import { PharmacistSidebar } from './Sidebar';

interface PharmacistLayoutProps {
  children: React.ReactNode;
  title: string;
  rightAction?: React.ReactNode;
}

export const PharmacistLayout: React.FC<PharmacistLayoutProps> = ({
  children,
  title,
  rightAction,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PharmacistSidebar />
      <div className="flex-1 ml-64">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {rightAction && <div>{rightAction}</div>}
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

