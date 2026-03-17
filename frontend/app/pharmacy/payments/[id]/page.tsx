'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { useAuthStore } from '@/lib/store/authStore';
import { paymentsAPI, Payment } from '@/lib/api/payments';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Printer,
} from 'lucide-react';
import Link from 'next/link';

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = Number(params.id);
  const user = useAuthStore((state) => state.user);
  const pharmacyId = user?.relatedId || 1;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);
  const [paymentDate, setPaymentDate] = useState('');
  const [transferName, setTransferName] = useState('');
  const [confirmationNote, setConfirmationNote] = useState('');
  const [pharmacyInfo, setPharmacyInfo] = useState<any>(null);

  useEffect(() => {
    fetchPaymentDetail();
    fetchPharmacyInfo();
  }, [paymentId, pharmacyId]);

  const fetchPaymentDetail = async () => {
    setLoading(true);
    try {
      const response = await paymentsAPI.getById(paymentId);
      if (response.success && response.data) {
        setPayment(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch payment detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPharmacyInfo = async () => {
    try {
      // 薬局情報を取得（必要に応じて実装）
      // 現在はpayment.contractから取得できる情報を使用
    } catch (error) {
      console.error('Failed to fetch pharmacy info:', error);
    }
  };

  const handleReportPayment = async () => {
    if (!paymentDate || !transferName) {
      alert('支払い日と振込名義を入力してください');
      return;
    }

    if (!confirm('この内容で支払い報告をしますか？')) return;

    setReporting(true);
    try {
      const response = await paymentsAPI.reportPayment(
        paymentId,
        pharmacyId,
        paymentDate,
        transferName,
        confirmationNote
      );

      if (response.success) {
        alert('支払い報告を送信しました。運営の確認をお待ちください。');
        // 請求書管理画面に遷移
        router.push('/pharmacy/payments');
      }
    } catch (error: any) {
      console.error('Failed to report payment:', error);
      alert(error.response?.data?.error || '支払い報告に失敗しました');
    } finally {
      setReporting(false);
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

  if (!payment) {
    return (
      <ProtectedRoute requiredUserType="pharmacy">
        <PharmacyLayout>
          <div className="text-center py-12">
            <p className="text-gray-500">請求書が見つかりません</p>
            <Link href="/pharmacy/payments" className="text-blue-600 hover:underline mt-4 inline-block">
              請求書一覧に戻る
            </Link>
          </div>
        </PharmacyLayout>
      </ProtectedRoute>
    );
  }

  const getStatusDisplay = () => {
    switch (payment.paymentStatus) {
      case 'pending':
        return {
          label: '支払い待ち',
          color: 'orange',
          icon: <Clock className="w-6 h-6" />,
          message: 'プラットフォーム手数料のお支払いをお願いします。',
        };
      case 'reported':
        return {
          label: '支払い報告済み',
          color: 'blue',
          icon: <AlertCircle className="w-6 h-6" />,
          message: '支払い報告を受け付けました。運営が確認中です。',
        };
      case 'confirmed':
        return {
          label: '支払い確認済み',
          color: 'green',
          icon: <CheckCircle className="w-6 h-6" />,
          message: '支払いが確認されました。契約が成立しました。',
        };
      case 'overdue':
        return {
          label: '期限超過',
          color: 'red',
          icon: <AlertCircle className="w-6 h-6" />,
          message: '支払い期限を過ぎています。契約がキャンセルされました。',
        };
      default:
        return {
          label: payment.paymentStatus,
          color: 'gray',
          icon: <AlertCircle className="w-6 h-6" />,
          message: '',
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <ProtectedRoute requiredUserType="pharmacy">
      <PharmacyLayout hideSidebar={true}>
        {/* 印刷時：Chrome空白ページ対策 + Safari 1ページ化 */}
        <style jsx global>{`
          @media print {
            /* レイアウトラッパーの高さを崩してChrome空白ページを防ぐ */
            html, body, #__next {
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
            }
            .min-h-screen {
              min-height: 0 !important;
              height: auto !important;
            }
            .flex-1 {
              flex: none !important;
              height: auto !important;
              overflow: visible !important;
            }
            .overflow-y-auto { overflow: visible !important; }

            /* 印刷時のみ表示・非表示 */
            .no-print  { display: none !important; }
            .print-only { display: block !important; }
            .screen-only { display: none !important; }

            /* 印刷用ヘッダーのフォントをコンパクトに */
            .invoice-print-header h1 { font-size: 14px !important; margin: 0 0 2px !important; }
            .invoice-print-header p  { font-size: 9px !important; margin: 0 !important; }
            .invoice-print-header .inv-meta { font-size: 10px !important; }
            .invoice-print-header .inv-meta-bold { font-size: 12px !important; }
            .invoice-print-header .bill-to { font-size: 11px !important; padding: 4px 6px !important; margin-bottom: 4px !important; }
            .invoice-print-header .bill-to-name { font-size: 13px !important; margin: 0 0 1px !important; }
          }
        `}</style>
        <div className="space-y-6 invoice-container">
          {/* ヘッダー */}
          <div className="flex items-center justify-between no-print">
            <div>
              <Link
                href="/pharmacy/payments"
                className="text-blue-600 hover:underline text-sm mb-2 inline-block"
              >
                ← 請求書一覧に戻る
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                請求書 INV-{String(payment.contractId).padStart(6, '0')}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Printer className="w-4 h-4" />
                <span>印刷 / PDF保存</span>
              </button>
            </div>
          </div>

          {/* 印刷用ヘッダー（印刷時のみ表示） */}
          <div className="hidden print-only invoice-print-header">
            {/* タイトル行 + 発行日（横並び） */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <h1 className="text-2xl font-bold">プラットフォーム手数料 請求書</h1>
                <p className="text-gray-600">Platform Fee Invoice　登録番号 T8120001241474</p>
              </div>
              <div className="text-right inv-meta">
                <p className="text-gray-600">請求書番号</p>
                <p className="font-bold inv-meta-bold">INV-{String(payment.contractId).padStart(6, '0')}</p>
                <p className="text-gray-600 mt-1">発行日</p>
                <p className="font-bold inv-meta-bold">{format(new Date(), 'yyyy年MM月dd日', { locale: ja })}</p>
              </div>
            </div>

            {/* 請求先情報（印刷時のみ表示） */}
            {payment.contract && (
              <div className="bill-to p-3 border-2 border-gray-400 mb-3">
                <p className="text-sm text-gray-600 mb-1">請求先</p>
                <p className="bill-to-name text-lg font-bold">
                  {payment.contract.pharmacy?.pharmacyName || payment.contract.pharmacy?.companyName || payment.contract.pharmacy?.name || '薬局名'} 御中
                </p>
                {(payment.contract.pharmacy?.address || payment.contract.pharmacy?.prefecture) && (
                  <p className="text-sm">
                    {payment.contract.pharmacy?.prefecture || ''}{payment.contract.pharmacy?.address || ''}
                  </p>
                )}
                {payment.contract.pharmacy?.phoneNumber && (
                  <p className="text-sm">TEL: {payment.contract.pharmacy.phoneNumber}</p>
                )}
              </div>
            )}
          </div>

          {/* ステータス */}
          <div className={`bg-${statusDisplay.color}-50 border border-${statusDisplay.color}-200 rounded-lg p-6 status-banner no-print`}>
            <div className="flex items-center space-x-3">
              <div className={`text-${statusDisplay.color}-600`}>{statusDisplay.icon}</div>
              <div>
                <h2 className={`text-lg font-semibold text-${statusDisplay.color}-900`}>
                  {statusDisplay.label}
                </h2>
                <p className={`text-sm text-${statusDisplay.color}-700 mt-1`}>
                  {statusDisplay.message}
                </p>
              </div>
            </div>
          </div>

          {/* 請求内容 */}
          <div className="bg-white rounded-lg shadow p-6 invoice-card no-break">
            <h2 className="text-lg font-semibold mb-4 screen-only">請求内容</h2>
            <h2 className="text-xl font-bold mb-4 hidden print-only">請求内訳</h2>
            <div className="space-y-6">
              {payment.contract?.platformFee != null ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">プラットフォーム手数料（報酬の40%・税抜）</span>
                    <span className="font-medium">¥{payment.contract.platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">消費税（10%）</span>
                    <span className="font-medium">¥{Math.floor(payment.contract.platformFee * 0.1).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 pt-2 border-b-2 border-gray-400">
                    <span className="text-lg font-semibold text-gray-900">お支払い金額（税込）</span>
                    <span className="text-3xl font-bold text-gray-900 invoice-amount">
                      ¥{Math.floor(payment.contract.platformFee * 1.1).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pb-4 border-b-2 border-gray-400">
                  <span className="text-lg font-semibold text-gray-900">請求額</span>
                  <span className="text-3xl font-bold text-gray-900 invoice-amount">
                    ¥{payment.amount.toLocaleString()}
                  </span>
                </div>
              )}

              {payment.contract && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        契約ID
                      </label>
                      <span className="text-gray-900">
                        {payment.contractId}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        薬剤師名
                      </label>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400 screen-only" />
                        <span className="text-gray-900">
                          {payment.contract.pharmacist?.lastName}{' '}
                          {payment.contract.pharmacist?.firstName} 様
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        初回出勤日
                      </label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400 screen-only" />
                        <span className="text-gray-900">
                          {format(new Date(payment.contract.initialWorkDate), 'yyyy年MM月dd日', {
                            locale: ja,
                          })}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        支払い期限
                      </label>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400 screen-only" />
                        <span className="text-gray-900">
                          {format(new Date(payment.contract.paymentDeadline), 'yyyy年MM月dd日', {
                            locale: ja,
                          })}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        勤務日数
                      </label>
                      <span className="text-gray-900">{payment.contract.workDays}日間</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        日給
                      </label>
                      <span className="text-gray-900">
                        ¥{payment.contract.dailyWage.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        報酬総額
                      </label>
                      <span className="text-gray-900">
                        ¥{payment.contract.totalCompensation.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        プラットフォーム手数料 (40%・税込)
                      </label>
                      <span className="text-gray-900">
                        ¥{Math.floor(payment.contract.platformFee * 1.1).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 振込先情報 */}
          <div className="bg-white rounded-lg shadow p-6 invoice-card no-break">
            <h2 className="text-lg font-semibold mb-4">お振込先情報</h2>
            <div className="space-y-3 text-sm">
              <div className="flex border-b border-gray-200 pb-2">
                <span className="w-32 font-medium text-gray-700">銀行名:</span>
                <span className="text-gray-900">GMOあおぞらネット銀行</span>
              </div>
              <div className="flex border-b border-gray-200 pb-2">
                <span className="w-32 font-medium text-gray-700">支店名:</span>
                <span className="text-gray-900">法人営業部（101）</span>
              </div>
              <div className="flex border-b border-gray-200 pb-2">
                <span className="w-32 font-medium text-gray-700">口座種別:</span>
                <span className="text-gray-900">普通</span>
              </div>
              <div className="flex border-b border-gray-200 pb-2">
                <span className="w-32 font-medium text-gray-700">口座番号:</span>
                <span className="text-gray-900 font-bold">2523006</span>
              </div>
              <div className="flex">
                <span className="w-32 font-medium text-gray-700">口座名義:</span>
                <span className="text-gray-900">カ）トレスクーレ</span>
              </div>
            </div>
          </div>

          {/* 支払い報告フォーム */}
          {payment.paymentStatus === 'pending' && (
            <div className="bg-white rounded-lg shadow p-6 payment-form no-print">
              <h2 className="text-lg font-semibold mb-4">支払い報告</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    支払い日 *
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    振込名義 *
                  </label>
                  <input
                    type="text"
                    value={transferName}
                    onChange={(e) => setTransferName(e.target.value)}
                    placeholder="例: 株式会社◯◯薬局 または 山田太郎"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    確認用メモ（任意）
                  </label>
                  <textarea
                    value={confirmationNote}
                    onChange={(e) => setConfirmationNote(e.target.value)}
                    placeholder="振込の控え番号など、確認に役立つ情報があればご記入ください"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <button
                  onClick={handleReportPayment}
                  disabled={reporting}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {reporting ? '送信中...' : '支払いを報告する'}
                </button>
              </div>
            </div>
          )}

          {/* 支払い報告情報（報告済みの場合） */}
          {(payment.paymentStatus === 'reported' || payment.paymentStatus === 'confirmed') &&
            payment.paymentDate && (
              <div className="bg-white rounded-lg shadow p-6 no-print">
                <h2 className="text-lg font-semibold mb-4">支払い報告情報</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      支払い日
                    </label>
                    <span className="text-gray-900">
                      {format(new Date(payment.paymentDate), 'yyyy年MM月dd日', { locale: ja })}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      振込名義
                    </label>
                    <span className="text-gray-900">{payment.transferName}</span>
                  </div>
                  {payment.confirmationNote && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        確認用メモ
                      </label>
                      <span className="text-gray-900">{payment.confirmationNote}</span>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      報告日時
                    </label>
                    <span className="text-gray-900">
                      {payment.reportedAt &&
                        format(new Date(payment.reportedAt), 'yyyy年MM月dd日 HH:mm', {
                          locale: ja,
                        })}
                    </span>
                  </div>
                  {payment.confirmedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        確認日時
                      </label>
                      <span className="text-gray-900">
                        {format(new Date(payment.confirmedAt), 'yyyy年MM月dd日 HH:mm', {
                          locale: ja,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

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
              <li>・お振込の際は、請求書番号（INV-{String(payment.contractId).padStart(6, '0')}）をお振込名義人欄にご記入ください</li>
              <li>・振込手数料は貴社にてご負担ください</li>
              <li>・薬剤師への報酬は、体験期間終了後に直接お支払いください</li>
            </ul>
          </div>

          {/* 印刷用フッター */}
          <div className="hidden print-only mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-600">
            <p className="font-semibold mb-2">ヤクナビ運営事務局</p>
            <p>お問い合わせ: info@yaku-navi.com</p>
            <p>TEL: 0120-XXX-XXXX（平日 9:00-18:00）</p>
          </div>
        </div>
      </PharmacyLayout>
    </ProtectedRoute>
  );
}


