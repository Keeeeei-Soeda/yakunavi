'use client';

import React, { useState, useEffect } from 'react';
import { PharmacySidebar } from './Sidebar';
import { Bell, Menu } from 'lucide-react';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        let prevWidth = window.innerWidth;
        setIsMobile(prevWidth < 900);
        const checkMobile = () => {
            const currentWidth = window.innerWidth;
            if (currentWidth !== prevWidth) {
                prevWidth = currentWidth;
                setIsMobile(currentWidth < 900);
            }
        };
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex overflow-x-hidden w-full">
            {!hideSidebar && (
                <PharmacySidebar
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                    isMobile={isMobile}
                />
            )}

            <div
                className={`flex-1 min-w-0 overflow-x-hidden flex flex-col ${
                    hideSidebar ? 'w-full' : isMobile ? 'ml-0' : 'ml-64'
                }`}
            >
                {/* ヘッダー */}
                {title && (
                    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
                        <div className="px-4 md:px-8 py-3 md:py-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    {/* モバイル用ハンバーガーボタン */}
                                    {!hideSidebar && isMobile && (
                                        <button
                                            onClick={() => setIsMobileMenuOpen(true)}
                                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                            aria-label="メニューを開く"
                                        >
                                            <Menu size={20} />
                                        </button>
                                    )}
                                    <h1 className="text-lg md:text-2xl font-bold text-gray-900">{title}</h1>
                                </div>
                                <div className="flex items-center gap-2 md:gap-4">
                                    {rightAction}
                                    <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                        <Bell size={20} />
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                {/* メインコンテンツ */}
                <main className="flex-1 p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};
