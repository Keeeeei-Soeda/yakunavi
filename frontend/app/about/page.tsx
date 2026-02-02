'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center">
              <div className="h-12 w-auto flex items-center">
                <Image
                  src="/logo_yakunavi.png"
                  alt="薬ナビ"
                  width={120}
                  height={48}
                  className="h-12 w-auto"
                />
              </div>
            </Link>
            <div className="flex items-center space-x-3">
              <Link
                href="/contact"
                className="text-gray-700 hover:text-teal-600 transition-colors text-sm font-medium"
              >
                お問い合わせ
              </Link>
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-teal-600 transition-colors text-sm"
              >
                ログイン
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* メインコンテンツ */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12">
            会社概要
          </h1>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">会社名</h2>
              <p className="text-gray-700 leading-relaxed">
                株式会社Tres Cura
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">所在地</h2>
              <p className="text-gray-700 leading-relaxed">
                〒547-0027<br />
                大阪府大阪市平野区喜連1-1-54-203
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">担当者</h2>
              <p className="text-gray-700 leading-relaxed">
                津守貴裕
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-4">薬ナビ</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                理想のキャリアを実現する転職支援サービス
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base mb-4">サービス</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><Link href="/" className="hover:text-teal-400 transition-colors">おためし転職</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base mb-4">会社情報</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-teal-400 transition-colors">会社概要</Link></li>
                <li><Link href="/contact" className="hover:text-teal-400 transition-colors">お問い合わせ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base mb-4">その他</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><Link href="/terms" className="hover:text-teal-400 transition-colors">利用規約</Link></li>
                <li><Link href="/privacy" className="hover:text-teal-400 transition-colors">プライバシーポリシー</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2026 薬ナビ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

