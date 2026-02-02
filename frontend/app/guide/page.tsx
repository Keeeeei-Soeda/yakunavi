'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
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
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/auth/register/pharmacist"
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all inline-block"
                >
                  💊 薬剤師登録
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/auth/register/pharmacy"
                  className="px-4 py-2 bg-white text-teal-600 border-2 border-teal-500 rounded-full text-sm font-medium hover:bg-teal-50 transition-all inline-block"
                >
                  🏥 薬局登録
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* メインコンテンツ */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
              ガイダンス
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              薬ナビの使い方をご案内します
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* 薬剤師向けガイダンス */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">💊</span>
                薬剤師の方へ
              </h2>

              <div className="space-y-6">
                <div className="bg-teal-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">1. 無料登録</h3>
                  <p className="text-gray-700 leading-relaxed">
                    薬剤師として無料登録を行います。登録は約1分で完了します。
                  </p>
                </div>

                <div className="bg-teal-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">2. プロフィール作成</h3>
                  <p className="text-gray-700 leading-relaxed">
                    あなたのスキル、経験、希望条件などをプロフィールに記載します。
                  </p>
                </div>

                <div className="bg-teal-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">3. 求人を探す</h3>
                  <p className="text-gray-700 leading-relaxed">
                    気になる求人を検索し、詳細を確認します。
                  </p>
                </div>

                <div className="bg-teal-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">4. おためし転職開始</h3>
                  <p className="text-gray-700 leading-relaxed">
                    実際に働いてみて、職場の雰囲気や業務内容を体験します。日給が発生します。
                  </p>
                </div>

                <div className="bg-teal-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">5. 本採用決定</h3>
                  <p className="text-gray-700 leading-relaxed">
                    双方が納得したら、本採用を決定します。
                  </p>
                </div>
              </div>
            </div>

            {/* 薬局向けガイダンス */}
            <div className="pt-8 border-t border-gray-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🏥</span>
                薬局・病院の方へ
              </h2>

              <div className="space-y-6">
                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">1. 無料登録</h3>
                  <p className="text-gray-700 leading-relaxed">
                    薬局・病院として無料登録を行います。掲載料は無料です。
                  </p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">2. 求人を投稿</h3>
                  <p className="text-gray-700 leading-relaxed">
                    求人情報を投稿します。詳細な条件や職場の雰囲気を記載できます。
                  </p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">3. 応募者を確認</h3>
                  <p className="text-gray-700 leading-relaxed">
                    応募してきた薬剤師のプロフィールを確認します。
                  </p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">4. おためし転職開始</h3>
                  <p className="text-gray-700 leading-relaxed">
                    薬剤師が実際に働いてみて、スキルや人柄、職場との相性を確認します。
                  </p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">5. 本採用決定</h3>
                  <p className="text-gray-700 leading-relaxed">
                    双方が納得したら、本採用を決定します。本採用時の紹介手数料は不要です。
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-8 border-t border-gray-200">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                  さあ、始めましょう
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/auth/register/pharmacist"
                      className="px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all inline-block"
                    >
                      💊 薬剤師として登録
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/auth/register/pharmacy"
                      className="px-8 py-4 bg-white text-teal-600 border-2 border-teal-500 text-lg font-bold rounded-xl hover:bg-teal-50 transition-all inline-block"
                    >
                      🏥 薬局として登録
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
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

