'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { contractsAPI } from '@/lib/api/contracts';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const contractId = Number(params.contractId);

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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

  const handleDownloadPDF = async () => {
    if (!contract || !contract.documents || contract.documents.length === 0) {
      alert('請求書が見つかりません');
      return;
    }

    const invoiceDoc = contract.documents.find((doc: any) => doc.documentType === 'invoice');
    if (!invoiceDoc) {
      alert('請求書が見つかりません');
      return;
    }

    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/documents/${invoiceDoc.id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `請求書_${contract.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('PDFをダウンロードしました');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('PDFのダウンロードに失敗しました');
    } finally {
      setDownloading(false);
    }
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
      <PharmacyLayout>
        <div className="space-y-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">プラットフォーム手数料 請求書</h1>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium disabled:bg-gray-300"
            >
              <Download size={20} />
              {downloading ? 'ダウンロード中...' : 'PDFダウンロード'}
            </button>
          </div>

          {/* 請求書本体 */}
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            {/* タイトル */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                プラットフォーム手数料 請求書
              </h2>
              <p className="text-sm text-gray-600">Platform Fee Invoice</p>
            </div>

            {/* 請求書番号・発行日 */}
            <div className="flex justify-between mb-8">
              <div>
                <p className="text-sm text-gray-600">請求書番号</p>
                <p className="text-lg font-semibold">{invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">発行日</p>
                <p className="text-lg font-semibold">
                  {format(issueDate, 'yyyy年MM月dd日', { locale: ja })}
                </p>
              </div>
            </div>

            {/* 請求先 */}
            <div className="mb-8 bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">請求先</h3>
              <p className="text-xl font-bold text-gray-900">{contract.pharmacy?.pharmacyName || '薬局名不明'} 御中</p>
              <p className="text-sm text-gray-700 mt-2">
                {contract.pharmacy?.prefecture || ''}{contract.pharmacy?.address || ''}
              </p>
              <p className="text-sm text-gray-700">
                TEL: {contract.pharmacy?.phoneNumber || ''}
              </p>
            </div>

            {/* 契約情報 */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">契約情報</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">契約番号</p>
                  <p className="font-medium">CNT-{format(issueDate, 'yyyy-MMdd', { locale: ja })}-{String(contract.id).padStart(3, '0')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">薬剤師名</p>
                  <p className="font-medium">
                    {contract.pharmacist?.lastName || ''} {contract.pharmacist?.firstName || ''} 様
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">勤務予定日数</p>
                  <p className="font-medium">{contract.workDays}日間</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">初回出勤予定日</p>
                  <p className="font-medium">
                    {format(new Date(contract.initialWorkDate), 'yyyy年MM月dd日（E）', { locale: ja })}
                  </p>
                </div>
              </div>
            </div>

            {/* 請求内容 */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">請求内容</h3>
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left">項目</th>
                    <th className="border border-gray-300 px-4 py-3 text-right">金額</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">
                      薬剤師紹介サービス利用料
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                      ¥{contract.totalCompensation?.toLocaleString() || '0'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">
                      プラットフォーム手数料（40%）
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                      ¥{contract.platformFee?.toLocaleString() || '0'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* お支払い金額 */}
            <div className="mb-8 bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
              <div className="flex justify-between items-center">
                <p className="text-xl font-bold text-gray-900">お支払い金額（税込）</p>
                <p className="text-3xl font-bold text-blue-600">
                  ¥{contract.platformFee?.toLocaleString() || '0'}
                </p>
              </div>
            </div>

            {/* お振込先情報 */}
            <div className="mb-8 bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">お振込先情報</h3>
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="w-24 text-gray-600">銀行名:</span>
                  <span className="font-medium">三菱UFJ銀行</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-600">支店名:</span>
                  <span className="font-medium">渋谷支店</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-600">口座種別:</span>
                  <span className="font-medium">普通</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-600">口座番号:</span>
                  <span className="font-medium">1234567</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-600">口座名義:</span>
                  <span className="font-medium">カ）ヤクナビ</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-600">お支払い期限:</span>
                  <span className="font-medium text-red-600">
                    {format(new Date(contract.paymentDeadline), 'yyyy年MM月dd日（E）', { locale: ja })}
                  </span>
                </div>
              </div>
            </div>

            {/* 重要事項 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ 重要事項</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• お支払い確認後、薬剤師の個人情報（連絡先、免許情報等）が開示されます。</li>
                <li>• 期限内にお支払いが確認できない場合、契約がキャンセルされる場合があります。</li>
                <li>
                  • お振込の際は、請求書番号（{invoiceNumber}）をお振込名義人に含めてご入金ください。
                </li>
                <li>• 振込手数料は当社にてご負担させていただきます。</li>
              </ul>
            </div>

            {/* 発行元 */}
            <div className="mt-8 pt-6 border-t border-gray-300 text-center">
              <p className="font-bold text-lg mb-2">ヤクナビ運営事務局</p>
              <p className="text-sm text-gray-600">お問い合わせ: support@yakunavi.jp</p>
              <p className="text-sm text-gray-600">TEL: 0120-XXX-XXXX（平日 9:00-18:00）</p>
            </div>
          </div>
        </div>
      </PharmacyLayout>
    </ProtectedRoute>
  );
}

