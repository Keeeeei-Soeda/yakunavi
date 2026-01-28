'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacistLayout } from '@/components/pharmacist/Layout';
import { contractsAPI, Contract } from '@/lib/api/contracts';
import { documentsAPI } from '@/lib/api/documents';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ArrowLeft, FileText, Download, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = Number(params.id);

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

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

  // ドキュメントをダウンロード
  const handleDownload = async (documentId: number, documentType: string) => {
    setDownloading(documentId);
    try {
      const result = await documentsAPI.download(
        documentId,
        'pharmacist',
        `${documentType}_契約${contractId}.pdf`
      );
      
      if (!result.success) {
        alert(result.error || 'ダウンロードに失敗しました');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      alert(error.message || 'ダウンロードに失敗しました');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredUserType="pharmacist">
        <PharmacistLayout title="契約詳細">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        </PharmacistLayout>
      </ProtectedRoute>
    );
  }

  if (!contract) {
    return (
      <ProtectedRoute requiredUserType="pharmacist">
        <PharmacistLayout title="契約詳細">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">契約が見つかりません</div>
          </div>
        </PharmacistLayout>
      </ProtectedRoute>
    );
  }

  const isContactDisclosed = ['active', 'completed'].includes(contract.status);

  return (
    <ProtectedRoute requiredUserType="pharmacist">
      <PharmacistLayout title="契約詳細">
        <div className="space-y-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/pharmacist/contracts"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </Link>
            </div>
            <Link
              href={`/pharmacist/messages?applicationId=${contract.applicationId}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <MessageSquare size={20} />
              メッセージ
            </Link>
          </div>

          {/* ステータス表示 */}
          <div className="bg-white rounded-lg shadow p-6">
            {contract.status === 'pending_payment' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-lg font-semibold text-orange-900">
                      薬局の手数料支払い待ち
                    </p>
                    <p className="text-sm text-orange-700 mt-2">
                      支払い期限: {format(new Date(contract.paymentDeadline), 'yyyy年MM月dd日（E）', { locale: ja })}
                    </p>
                    <p className="text-sm text-orange-700 mt-2">
                      薬局がプラットフォーム手数料を支払い後、薬局の連絡先が開示されます。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {contract.status === 'active' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-lg font-semibold text-green-900">
                      契約成立：勤務中
                    </p>
                    <p className="text-sm text-green-700 mt-2">
                      薬局の連絡先が開示されました。直接連絡を取り合って勤務日程を調整してください。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {contract.status === 'completed' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      契約完了
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      勤務お疲れ様でした。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 契約情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">契約情報</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">求人</p>
                <p className="font-medium">{contract.jobPosting?.title || '求人情報なし'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">薬局</p>
                <p className="font-medium">{contract.pharmacy?.name || '薬局情報なし'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">初回出勤日</p>
                <p className="font-medium">
                  {format(new Date(contract.initialWorkDate), 'yyyy年MM月dd日（E）', { locale: ja })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">勤務日数</p>
                <p className="font-medium">{contract.workDays}日間</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">日給</p>
                <p className="font-medium">¥{contract.dailyWage.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">報酬総額</p>
                <p className="font-medium text-lg text-green-600">
                  ¥{contract.totalCompensation.toLocaleString()}
                </p>
              </div>
              {contract.workHours && (
                <div>
                  <p className="text-sm text-gray-600">勤務時間（目安）</p>
                  <p className="font-medium">{contract.workHours}</p>
                </div>
              )}
            </div>
          </div>

          {/* 薬局の連絡先（手数料支払い後） */}
          {isContactDisclosed && contract.pharmacy && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🏥 薬局の連絡先
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800">
                  ✅ プラットフォーム手数料の支払いが完了したため、薬局の連絡先が開示されました
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">薬局名</p>
                  <p className="font-medium text-lg">{contract.pharmacy.name}</p>
                </div>
                {contract.pharmacy.phone && (
                  <div>
                    <p className="text-sm text-gray-600">電話番号</p>
                    <p className="font-medium text-lg">
                      <a href={`tel:${contract.pharmacy.phone}`} className="text-blue-600 hover:underline">
                        {contract.pharmacy.phone}
                      </a>
                    </p>
                  </div>
                )}
                {contract.pharmacy.email && (
                  <div>
                    <p className="text-sm text-gray-600">メールアドレス</p>
                    <p className="font-medium">
                      <a href={`mailto:${contract.pharmacy.email}`} className="text-blue-600 hover:underline">
                        {contract.pharmacy.email}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 労働条件通知書 */}
          {contract.status === 'active' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">労働条件通知書</h2>
              <p className="text-sm text-gray-600 mb-4">
                労働基準法第15条に基づく労働条件通知書を表示・印刷できます。
              </p>
              <Link
                href={`/pharmacist/contracts/${contractId}/labor-conditions`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileText size={20} />
                労働条件通知書を表示
              </Link>
            </div>
          )}

          {/* 契約書類（invoice以外） */}
          {contract.documents && contract.documents.filter((doc: any) => doc.documentType !== 'invoice').length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">契約書類</h2>
              <div className="space-y-3">
                {contract.documents
                  .filter((doc: any) => doc.documentType !== 'invoice')
                  .map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium">{doc.documentType}</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(doc.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(doc.id, doc.documentType)}
                        disabled={downloading === doc.id}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Download size={16} />
                        {downloading === doc.id ? 'ダウンロード中...' : 'ダウンロード'}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 重要事項 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📌 重要事項</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 報酬は体験期間終了後に薬局から直接お支払いいただきます</li>
              <li>• 具体的な勤務スケジュールは薬局と直接調整してください</li>
              <li>• 勤務に関する質問や変更がある場合は、メッセージ機能をご利用ください</li>
              <li>• トラブルが発生した場合は、運営にお問い合わせください</li>
            </ul>
          </div>
        </div>
      </PharmacistLayout>
    </ProtectedRoute>
  );
}

