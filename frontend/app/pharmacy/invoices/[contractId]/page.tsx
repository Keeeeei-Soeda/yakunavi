'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { contractsAPI } from '@/lib/api/contracts';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Download } from 'lucide-react';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const contractId = Number(params.contractId);

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContractDetail();
  }, [contractId]);

  const fetchContractDetail = async () => {
    setLoading(true);
    try {
      const response = await contractsAPI.getById(contractId);
      if (response.success && response.data) {
        setContract(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch contract detail:', error);
    } finally {
      setLoading(false);
    }
  };

  // 印刷機能
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <ProtectedRoute requiredUserType="pharmacy">
        <PharmacyLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        </PharmacyLayout>
      </ProtectedRoute>
    );
  }

  if (!contract) {
    return (
      <ProtectedRoute requiredUserType="pharmacy">
        <PharmacyLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">契約が見つかりません</div>
          </div>
        </PharmacyLayout>
      </ProtectedRoute>
    );
  }

  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(contract.id).padStart(3, '0')}`;
  const issueDate = contract.createdAt ? new Date(contract.createdAt) : new Date();

  return (
    <ProtectedRoute requiredUserType="pharmacy">
      <PharmacyLayout hideSidebar={true}>
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .invoice-container,
            .invoice-container * {
              visibility: visible;
            }
            .invoice-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
            .print-only {
              display: block !important;
            }
            .screen-only {
              display: none !important;
            }
            .no-break {
              page-break-inside: avoid;
            }
            .invoice-card {
              box-shadow: none !important;
              border: 1px solid #ddd;
            }
            .invoice-amount {
              font-size: 2rem;
            }
          }
          .print-only {
            display: none;
          }
        `}</style>

        <div className="space-y-6 invoice-container">
          {/* ヘッダー */}
          <div className="flex items-center justify-between no-print">
            <div>
              <button
                onClick={() => router.back()}
                className="text-blue-600 hover:underline text-sm mb-2 inline-block"
              >
                ← 契約一覧に戻る
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                請求書 INV-{String(contract.id).padStart(6, '0')}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download size={20} />
                <span>印刷 / PDF保存</span>
              </button>
            </div>
          </div>

          {/* 印刷用ヘッダー（印刷時のみ表示） */}
          <div className="hidden print-only mb-6">
            <div className="text-right text-sm text-gray-600 mb-4">
              発行日: {format(issueDate, 'yyyy年MM月dd日', { locale: ja })}
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">
              プラットフォーム手数料 請求書
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Platform Fee Invoice
            </p>
          </div>

          {/* 請求書本体 */}
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto invoice-container">
            {/* タイトル（画面表示時のみ） */}
            <div className="text-center mb-8 screen-only">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                プラットフォーム手数料 請求書
              </h2>
              <p className="text-sm text-gray-600">Platform Fee Invoice</p>
            </div>

            {/* 請求書番号・発行日 */}
            <div className="flex justify-between mb-8 print-only">
              <div>
                <p className="text-sm text-gray-600 mb-1">請求書番号</p>
                <p className="text-lg font-bold">
                  {invoiceNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">発行日</p>
                <p className="text-lg font-bold">
                  {format(issueDate, 'yyyy年MM月dd日', { locale: ja })}
                </p>
              </div>
            </div>

            {/* 請求先 */}
            <div className="mb-6 p-4 border-2 border-gray-400 no-break">
              <h3 className="font-semibold text-lg mb-3">請求先</h3>
              <p className="text-xl font-bold mb-2">
                {contract.pharmacy?.pharmacyName || '薬局名不明'} 御中
              </p>
              {(contract.pharmacy?.address || contract.pharmacy?.prefecture) && (
                <p className="text-sm mb-1">
                  {contract.pharmacy?.prefecture || ''}{contract.pharmacy?.address || ''}
                </p>
              )}
              {contract.pharmacy?.phoneNumber && (
                <p className="text-sm">
                  TEL: {contract.pharmacy.phoneNumber}
                </p>
              )}
            </div>

            {/* 契約情報 */}
            <div className="mb-8 no-break">
              <h3 className="text-xl font-bold mb-4 hidden print-only">契約情報</h3>
              <h3 className="font-semibold text-gray-900 mb-3 screen-only">契約情報</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    契約ID
                  </label>
                  <span className="text-gray-900">
                    {contract.id}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    薬剤師名
                  </label>
                  <span className="text-gray-900">
                    {contract.pharmacist?.lastName || ''} {contract.pharmacist?.firstName || ''} 様
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    初回出勤日
                  </label>
                  <span className="text-gray-900">
                    {format(new Date(contract.initialWorkDate), 'yyyy年MM月dd日', {
                      locale: ja,
                    })}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    支払い期限
                  </label>
                  <span className="text-gray-900">
                    {format(new Date(contract.paymentDeadline), 'yyyy年MM月dd日', {
                      locale: ja,
                    })}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    勤務日数
                  </label>
                  <span className="text-gray-900">{contract.workDays}日間</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    日給
                  </label>
                  <span className="text-gray-900">
                    ¥{contract.dailyWage.toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    報酬総額
                  </label>
                  <span className="text-gray-900">
                    ¥{contract.totalCompensation.toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    プラットフォーム手数料 (40%)
                  </label>
                  <span className="text-gray-900">
                    ¥{contract.platformFee.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 請求内容 */}
            <div className="mb-8 no-break">
              <h2 className="text-lg font-semibold mb-4 screen-only">請求内容</h2>
              <h2 className="text-xl font-bold mb-4 hidden print-only">請求内訳</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b-2 border-gray-400">
                  <span className="text-lg font-semibold text-gray-900">請求額</span>
                  <span className="text-3xl font-bold text-gray-900 invoice-amount">
                    ¥{contract.platformFee?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </div>

            {/* 振込先情報 */}
            <div className="bg-white rounded-lg shadow p-6 invoice-card no-break">
              <h2 className="text-lg font-semibold mb-4">お振込先情報</h2>
              <div className="space-y-3 text-sm">
                <div className="flex border-b border-gray-200 pb-2">
                  <span className="w-32 font-medium text-gray-700">銀行名:</span>
                  <span className="text-gray-900">paypay銀行</span>
                </div>
                <div className="flex border-b border-gray-200 pb-2">
                  <span className="w-32 font-medium text-gray-700">支店名:</span>
                  <span className="text-gray-900">ビジネス営業部（005）</span>
                </div>
                <div className="flex border-b border-gray-200 pb-2">
                  <span className="w-32 font-medium text-gray-700">口座種別:</span>
                  <span className="text-gray-900">普通</span>
                </div>
                <div className="flex border-b border-gray-200 pb-2">
                  <span className="w-32 font-medium text-gray-700">口座番号:</span>
                  <span className="text-gray-900 font-bold">7555812</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-medium text-gray-700">口座名義:</span>
                  <span className="text-gray-900">ｶ) ﾄﾚｽｸｰﾚ</span>
                </div>
              </div>
            </div>

            {/* 重要事項 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 no-print">
              <h3 className="font-semibold text-blue-900 mb-3">💡 お支払いについて</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>・振込手数料は貴社負担でお願いします</li>
                <li>・支払い報告後、運営が入金を確認します（1-2営業日）</li>
                <li>・確認完了後、薬剤師の連絡先が開示されます</li>
                <li>・薬剤師への報酬は、体験期間終了後に直接お支払いください</li>
              </ul>
            </div>

            {/* 印刷用の重要事項（印刷時のみ表示） */}
            <div className="hidden print-only mt-8 border-t-2 border-gray-400 pt-6">
              <h3 className="font-semibold text-lg mb-3">重要事項</h3>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li>・お支払い確認後、薬剤師の個人情報（連絡先、免許証情報等）が開示されます</li>
                <li>・期限内にお支払いが確認できない場合、契約がキャンセルされる場合があります</li>
                <li>・お振込の際は、請求書番号（{invoiceNumber}）をお振込名義人欄にご記入ください</li>
                <li>・振込手数料は貴社にてご負担ください</li>
                <li>・薬剤師への報酬は、体験期間終了後に直接お支払いください</li>
              </ul>
            </div>

            {/* 印刷用フッター */}
            <div className="hidden print-only mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-600">
              <p className="font-semibold mb-2">ヤクナビ運営事務局</p>
              <p>お問い合わせ: support@yakunavi.jp</p>
              <p>TEL: 0120-XXX-XXXX（平日 9:00-18:00）</p>
            </div>
          </div>
        </div>
      </PharmacyLayout>
    </ProtectedRoute>
  );
}

