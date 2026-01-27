'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { applicationsAPI } from '@/lib/api/applications';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ArrowLeft, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = Number(params.id);

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplicationDetail();
  }, [applicationId]);

  const fetchApplicationDetail = async () => {
    setLoading(true);
    try {
      const response = await applicationsAPI.getById(applicationId);
      if (response.success && response.data) {
        setApplication(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch application detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!confirm('この応募を承認しますか？')) return;

    setProcessing(true);
    try {
      await applicationsAPI.updateStatus(applicationId, 'accepted');
      alert('応募を承認しました');
      router.push('/pharmacy/applications');
    } catch (error: any) {
      console.error('Failed to accept:', error);
      alert(error.response?.data?.error || '承認に失敗しました');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('却下理由を入力してください（任意）:');
    if (reason === null) return;

    setProcessing(true);
    try {
      await applicationsAPI.updateStatus(applicationId, 'rejected', reason || undefined);
      alert('応募を却下しました');
      router.push('/pharmacy/applications');
    } catch (error: any) {
      console.error('Failed to reject:', error);
      alert(error.response?.data?.error || '却下に失敗しました');
    } finally {
      setProcessing(false);
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

  if (!application) {
    return (
      <ProtectedRoute requiredUserType="pharmacy">
        <PharmacyLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">応募が見つかりません</div>
          </div>
        </PharmacyLayout>
      </ProtectedRoute>
    );
  }

  const pharmacist = application.pharmacist;

  return (
    <ProtectedRoute requiredUserType="pharmacy">
      <PharmacyLayout>
        <div className="space-y-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/pharmacy/applications"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">応募者詳細</h1>
            </div>
            <div className="flex gap-2">
              {application.status === 'applied' && (
                <>
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:bg-gray-100 flex items-center gap-2"
                  >
                    <XCircle size={20} />
                    辞退する
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={processing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 flex items-center gap-2"
                  >
                    <CheckCircle size={20} />
                    承認する
                  </button>
                </>
              )}
              <Link
                href={`/pharmacy/messages?applicationId=${applicationId}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <MessageSquare size={20} />
                メッセージ
              </Link>
            </div>
          </div>

          {/* 応募情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">応募情報</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">求人</p>
                <p className="font-medium">{application.jobPosting?.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">応募日</p>
                <p className="font-medium">
                  {format(new Date(application.appliedAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ステータス</p>
                <p className="font-medium">{application.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">最寄駅</p>
                <p className="font-medium">{application.nearestStation || '未記入'}</p>
              </div>
            </div>
            {application.coverLetter && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">自己紹介</p>
                <p className="text-gray-800">{application.coverLetter}</p>
              </div>
            )}
          </div>

          {/* 重要な注記 */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              ⚠️ <strong>個人情報の取り扱いについて</strong>
            </p>
            <p className="text-sm text-orange-700 mt-2">
              プラットフォーム手数料のお支払い確認後に、薬剤師の氏名・電話番号・メールアドレスが開示されます。
              <br />
              住所は運営側でのみ管理されており、薬局側には開示されません。
            </p>
          </div>

          {/* 薬剤師プロフィール（手数料支払い前） */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              薬剤師プロフィール
            </h2>

            {/* 基本情報 */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">基本情報</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">年齢</p>
                  <p className="font-medium">{pharmacist?.age ? `${pharmacist.age}歳` : '未記入'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">出身大学</p>
                  <p className="font-medium">{pharmacist?.university || '未記入'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">卒業年</p>
                  <p className="font-medium">{pharmacist?.graduationYear ? `${pharmacist.graduationYear}年` : '未記入'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">薬剤師免許取得年</p>
                  <p className="font-medium">{pharmacist?.licenseYear ? `${pharmacist.licenseYear}年` : '未記入'}</p>
                </div>
              </div>
            </div>

            {/* 資格情報 */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">資格情報</h3>
              <div className="space-y-3">
                {pharmacist?.certifications && (
                  <div>
                    <p className="text-sm text-gray-600">認定薬剤師資格</p>
                    <p className="font-medium">{pharmacist.certifications || '未記入'}</p>
                  </div>
                )}
                {pharmacist?.otherQualifications && (
                  <div>
                    <p className="text-sm text-gray-600">その他の関連資格</p>
                    <p className="font-medium">{pharmacist.otherQualifications || '未記入'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 経歴 */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">経歴</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">勤務経験年数</p>
                  <p className="font-medium">
                    {pharmacist?.workExperienceYears !== undefined
                      ? `${pharmacist.workExperienceYears}年`
                      : '未記入'}
                  </p>
                </div>
                {application.workExperienceTypes && application.workExperienceTypes.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">勤務経験のある業態</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {application.workExperienceTypes.map((type: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {pharmacist?.mainDuties && pharmacist.mainDuties.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">主な業務経験</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {pharmacist.mainDuties.map((duty: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {duty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* スキル・専門分野 */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">スキル・専門分野</h3>
              <div className="space-y-3">
                {pharmacist?.specialtyAreas && pharmacist.specialtyAreas.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">得意な診療科・疾患領域</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {pharmacist.specialtyAreas.map((area: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {pharmacist?.pharmacySystems && pharmacist.pharmacySystems.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">使用経験のある薬歴システム</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {pharmacist.pharmacySystems.map((system: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {system}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {pharmacist?.specialNotes && (
                  <div>
                    <p className="text-sm text-gray-600">特記事項</p>
                    <p className="font-medium">{pharmacist.specialNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 自己紹介 */}
            {pharmacist?.selfIntroduction && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">自己紹介・アピールポイント</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{pharmacist.selfIntroduction}</p>
              </div>
            )}
          </div>
        </div>
      </PharmacyLayout>
    </ProtectedRoute>
  );
}

