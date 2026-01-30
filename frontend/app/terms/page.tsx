'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function TermsPage() {
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
            薬ナビ 利用規約
          </h1>

          <div className="space-y-8">
            <p className="text-gray-700 leading-relaxed">
              本規約は、株式会社Tres Cura（以下「当社」）が提供する体験型転職支援サービス「薬ナビ」（以下「本サービス」）の利用条件を定めるものです。
            </p>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">第1条（本サービスの内容）</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>本サービスは、薬剤師（以下「求職者」）と薬局等の事業者（以下「求人者」）に対し、相互の適性を確認するための「体験期間」を設けた転職マッチングプラットフォームです。</li>
                <li>当社はマッチングの場を提供するものであり、求人者・求職者間の個別の契約交渉やマッチングの成否に直接関与せず、バイアスのないプラットフォームを提供します。</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">第2条（体験期間と報酬）</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>体験期間は1〜6か月間で、求人者と求職者の合意により決定します。</li>
                <li>体験期間中の報酬は、当事者間の合意に基づき求人者が求職者へ直接支払うものとします。</li>
                <li>報酬の支払いは、体験期間の最終勤務日以降に速やかに行うものとし、当社は支払い管理に関与しません。</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">第3条（紹介手数料）</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>求人者は当社に対し、紹介手数料として体験期間中の報酬（月収×契約期間）の40%を支払うものとします。</li>
                <li>紹介手数料の支払期限は、初回出勤日の3日前までとします。</li>
                <li>支払いが確認されるまで、求職者の連絡先等の詳細情報は開示されません。</li>
                <li>一度支払われた紹介手数料は、体験期間中の勤務日数の変更等が生じた場合でも返金されません。</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">第4条（未払い時のペナルティ）</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>初回出勤日の前日23:59時点で紹介手数料の支払いが確認できない場合、当該契約は自動的にキャンセルされます。</li>
                <li>前項の場合、求人者には以下のペナルティが課されます：
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-6 mt-2">
                    <li>アカウントの停止および新規募集・既存募集の一時停止。</li>
                    <li>2回目の未払いが発生した場合は、アカウントの永久停止。</li>
                  </ul>
                </li>
                <li>ペナルティの解除には、未払い分の手数料の完納および当社による審査・承認が必要です。</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">第5条（契約の成立と労働条件）</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>求人者からのオファーに対し求職者が承認した時点で、システム上で労働条件通知書が自動発行され、契約が成立します。</li>
                <li>労働条件通知書には、勤務日数、就業場所、業務内容、賃金が記載されます。</li>
                <li>詳細な勤務スケジュールは、手数料の支払い確認後、当事者間で直接協議して決定するものとします。</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">第6条（体験期間終了後の対応）</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>求人者および求職者は、体験期間終了までに正式雇用の可否を判断します。</li>
                <li>正式雇用に至らない場合でも、求人者は体験期間中の勤務分に対する報酬を必ず支払わなければなりません。</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">第7条（禁止事項）</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>利用者は、本サービスを通じて知り得た情報を、本サービスの目的以外（直接雇用交渉の迂回等）に利用してはなりません。</li>
                <li>虚偽の情報登録、他者のなりすまし、その他本サービスの運営を妨げる行為を禁止します。</li>
              </ul>
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
                <li><a href="#" className="hover:text-teal-400 transition-colors">おためし転職</a></li>
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

