'use client';

import React from 'react';
import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* モーダル */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">薬ナビ 利用規約</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="overflow-y-auto p-6 flex-1">
          <div className="space-y-8">
            <p className="text-gray-700 leading-relaxed">
              本規約は、株式会社Tres Cura（以下「当社」）が提供する体験型転職支援サービス「薬ナビ」（以下「本サービス」）の利用条件を定めるものです。
            </p>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">第1条（本サービスの内容）</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>本サービスは、薬剤師（以下「求職者」）と薬局等の事業者（以下「求人者」）に対し、相互の適性を確認するための「体験期間」を設けた転職マッチングプラットフォームです。</li>
                <li>当社はマッチングの場を提供するものであり、求人者・求職者間の個別の契約交渉やマッチングの成否に直接関与せず、バイアスのないプラットフォームを提供します。</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">第2条（体験期間と報酬）</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>体験期間は1〜6か月間で、求人者と求職者の合意により決定します。</li>
                <li>体験期間中の報酬は、当事者間の合意に基づき求人者が求職者へ直接支払うものとします。</li>
                <li>報酬の支払いは、体験期間の最終勤務日以降に速やかに行うものとし、当社は支払い管理に関与しません。</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">第3条（紹介手数料）</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>求人者は当社に対し、紹介手数料として体験期間中の報酬（月収×契約期間）の40%を支払うものとします。</li>
                <li>紹介手数料の支払期限は、初回出勤日の3日前までとします。</li>
                <li>支払いが確認されるまで、求職者の連絡先等の詳細情報は開示されません。</li>
                <li>一度支払われた紹介手数料は、体験期間中の勤務日数の変更等が生じた場合でも返金されません。</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">第4条（未払い時のペナルティ）</h3>
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
              <h3 className="text-xl font-bold text-gray-900 mb-4">第5条（契約の成立と労働条件）</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>求人者からのオファーに対し求職者が承認した時点で、システム上で労働条件通知書が自動発行され、契約が成立します。</li>
                <li>労働条件通知書には、勤務日数、就業場所、業務内容、賃金が記載されます。</li>
                <li>詳細な勤務スケジュールは、手数料の支払い確認後、当事者間で直接協議して決定するものとします。</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">第6条（体験期間終了後の対応）</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>求人者および求職者は、体験期間終了までに正式雇用の可否を判断します。</li>
                <li>正式雇用に至らない場合でも、求人者は体験期間中の勤務分に対する報酬を必ず支払わなければなりません。</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">第7条（禁止事項）</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>利用者は、本サービスを通じて知り得た情報を、本サービスの目的以外（直接雇用交渉の迂回等）に利用してはなりません。</li>
                <li>虚偽の情報登録、他者のなりすまし、その他本サービスの運営を妨げる行為を禁止します。</li>
              </ul>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

