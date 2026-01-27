'use client';

import React from 'react';
import { PharmacySidebar } from './Sidebar';
import { Bell } from 'lucide-react';

interface PharmacyLayoutProps {
    children: React.ReactNode;
    title?: string;
    rightAction?: React.ReactNode;
    hideSidebar?: boolean;
}

export const PharmacyLayout: React.FC<PharmacyLayoutProps> = ({
    children,
    title,
    rightAction,
    hideSidebar = false,
}) => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {!hideSidebar && <PharmacySidebar />}

            <div className="flex-1 flex flex-col">
                {/* ヘッダー */}
                {title && (
                    <header className="bg-white border-b border-gray-200 px-8 py-4">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            <div className="flex items-center gap-4">
                                {rightAction}
                                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Bell size={20} />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>
                            </div>
                        </div>
                    </header>
                )}

                {/* メインコンテンツ */}
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

