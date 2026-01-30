'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
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
            個人情報保護方針
          </h1>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">第1条（目的）</h2>
              <p className="text-gray-700 leading-relaxed">
                本条項は、薬ナビ（以下「本サービス」）の利用を通じて、求人者、求職者、および株式会社Tres Cura（以下「当社」）が相互に開示する機密情報の取り扱いについて定めるものです。
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">第2条（機密情報の定義）</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                本条項において「機密情報」とは、形態のいかんを問わず、本サービスの利用過程（求人掲載、マッチング、体験雇用契約等）において開示された以下の情報をいいます。
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>個人情報: 求職者の氏名、経歴、資格、連絡先等。</li>
                <li>経営情報: 求人者の運営体制、処方箋データ、患者情報、独自の調剤ノウハウ、および内部の人間関係等。</li>
                <li>契約情報: 体験雇用契約の内容、給与額、および本サービスに関する取引条件。</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">第3条（機密保持義務）</h2>
              <p className="text-gray-700 leading-relaxed">
                求人者および求職者は、相手方から開示された機密情報を、本サービスの利用および体験雇用契約の履行以外の目的で使用してはなりません。また、相手方の事前の書面による承諾なく、第三者に漏洩または開示してはなりません。
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">第4条（体験入社における特則）</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>求職者は、1〜数か月の体験雇用契約期間中、実務を通じて知り得た求人者の患者情報および業務上の機密を厳重に保持しなければなりません。</li>
                <li>求人者は、体験期間中に把握した求職者のスキルや適性に関する情報を、正当な理由なく外部に公表してはなりません。</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">第5条（損害賠償）</h2>
              <p className="text-gray-700 leading-relaxed">
                求人者または求職者が本条項に違反し、相手方または当社に損害を与えた場合、その損害を賠償する責任を負うものとします。
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

