'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function FeesPage() {
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
            有料職業紹介事業における手数料表および返金規定
          </h1>

          <div className="space-y-10">
            {/* 1. 手数料表 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. 手数料表</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                当社の職業紹介における手数料は以下の通り定めております。
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm sm:text-base">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">雇用形態</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">手数料率（算出根拠）</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">備考</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3">無期雇用契約</td>
                      <td className="border border-gray-300 px-4 py-3">当該求職者の年間賃金の30％</td>
                      <td className="border border-gray-300 px-4 py-3">体験決定時に一括して申し受けます。</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3">有期雇用契約</td>
                      <td className="border border-gray-300 px-4 py-3">契約期間中の賃金総額の40％</td>
                      <td className="border border-gray-300 px-4 py-3">契約締結時に申し受けます。</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <p>※年間賃金（または賃金総額）とは、基本給、諸手当、賞与等を含む、法に定められた理論年収を指します。</p>
                <p>※上記手数料には消費税が別途加算されます。</p>
              </div>
            </div>

            {/* 2. 返金規定 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. 返金規定（リベート制度）</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                紹介により入社した求職者が、自己都合等を理由に早期退職に至った場合、受領した手数料を以下の基準で求人者様へ返金いたします。
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">【無期雇用の場合】</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm sm:text-base">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">退職までの期間</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">返金額（返金率）</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">入社日から1か月以内</td>
                          <td className="border border-gray-300 px-4 py-3">受領した紹介手数料の50％</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">入社日から1か月超 3か月以内</td>
                          <td className="border border-gray-300 px-4 py-3">受領した紹介手数料の30％</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">【有期雇用の場合】</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm sm:text-base">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">該当条件</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">返金額（返金率）</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">出勤初日に求職者が出勤しなかった場合</td>
                          <td className="border border-gray-300 px-4 py-3">受領した紹介手数料の100％（全額）</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">【免責事項・補足】</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-teal-600 font-bold">・</span>
                      <span>返金対象は「求職者の自己都合による退職」または「求職者の責めに帰すべき事由による解雇」の場合に限ります。</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-teal-600 font-bold">・</span>
                      <span>求人者側の都合（会社都合解雇や労働条件の相違等）による退職の場合は、返金対象外となります。</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-teal-600 font-bold">・</span>
                      <span>退職後、規定の期間内に書面にて通知をいただいた場合に限り、速やかに返金手続きを行います。</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* フッター（トップページと同一） */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
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
              <h4 className="font-bold text-sm sm:text-base mb-4">薬剤師の方</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><Link href="/auth/register/pharmacist" className="hover:text-teal-400 transition-colors">はじめての方は登録</Link></li>
                <li><Link href="/pharmacist/login" className="hover:text-teal-400 transition-colors">登録済みの方はログイン</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base mb-4">薬局・採用担当者</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><Link href="/auth/register/pharmacy" className="hover:text-teal-400 transition-colors">はじめての方は登録</Link></li>
                <li><Link href="/pharmacy/login" className="hover:text-teal-400 transition-colors">登録済みの方はログイン</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base mb-4">会社情報</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-teal-400 transition-colors">会社概要</Link></li>
                <li><Link href="/contact" className="hover:text-teal-400 transition-colors">お問い合わせ</Link></li>
                <li><Link href="/terms" className="hover:text-teal-400 transition-colors">利用規約</Link></li>
                <li><Link href="/privacy" className="hover:text-teal-400 transition-colors">プライバシーポリシー</Link></li>
                <li><Link href="/fees" className="hover:text-teal-400 transition-colors">有料職業紹介事業における手数料表および返金規定</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2026 薬ナビ. All rights reserved.</p>
            <p className="mt-1">有料職業紹介事業 許可番号：27-ユ-305193</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
