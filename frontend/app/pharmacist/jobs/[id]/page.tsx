'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacistLayout } from '@/components/pharmacist/Layout';
import { jobPostingsAPI, JobPosting } from '@/lib/api/jobPostings';
import { applicationsAPI } from '@/lib/api/applications';
import { pharmacistProfileAPI } from '@/lib/api/pharmacist-profile';
import { pharmacyAPI, PharmacyProfile } from '@/lib/api/pharmacy';
import { useAuthStore } from '@/lib/store/authStore';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ArrowLeft, MapPin, DollarSign, Calendar, Clock, AlertCircle, Send, Building2, Phone, Users, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { PREFECTURES } from '@/lib/constants/prefectures';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params.id);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const pharmacistId = user?.relatedId;

  // 認証の初期化を待ってからリダイレクト判定
  useEffect(() => {
    if (!isLoading && !pharmacistId) {
      console.error('pharmacistId is not set. Redirecting to login.');
      router.push('/pharmacist/login');
    }
  }, [pharmacistId, isLoading, router]);

  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [applying, setApplying] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);
  const [pharmacyProfile, setPharmacyProfile] = useState<PharmacyProfile | null>(null);
  const [loadingPharmacyProfile, setLoadingPharmacyProfile] = useState(false);

  // 応募フォーム
  const [applicationForm, setApplicationForm] = useState({
    nearestStation: '',
    workExperienceTypes: [] as string[],
    coverLetter: '',
  });

  const fetchJobDetail = async () => {
    setLoading(true);
    try {
      const response = await jobPostingsAPI.getById(jobId);
      if (response.success && response.data) {
        setJob(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch job detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = useCallback(async () => {
    if (!pharmacistId) return; // pharmacistIdがない場合は何もしない
    try {
      console.log('[Debug] Fetching profile for pharmacistId:', pharmacistId);
      const response = await pharmacistProfileAPI.getProfile(pharmacistId);
      console.log('[Debug] Profile response:', response);
      if (response.success && response.data) {
        console.log('[Debug] Setting profile:', response.data);
        setProfile(response.data);
        // プロフィールの最寄駅をデフォルト値として設定
        const profileData = response.data;
        if (profileData.nearestStation) {
          setApplicationForm(prev => ({
            ...prev,
            nearestStation: profileData.nearestStation || '',
          }));
        }
      } else {
        console.log('[Debug] Profile response not successful or no data');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }, [pharmacistId]);

  const fetchCertificates = useCallback(async () => {
    if (!pharmacistId) return; // pharmacistIdがない場合は何もしない
    try {
      const response = await pharmacistProfileAPI.getCertificates(pharmacistId);
      if (response.success && response.data) {
        setCertificates(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    }
  }, [pharmacistId]);

  useEffect(() => {
    fetchJobDetail();
  }, [jobId]);

  useEffect(() => {
    if (pharmacistId) {
      fetchProfile();
      fetchCertificates();
    }
  }, [pharmacistId, fetchProfile, fetchCertificates]);

  const handleApply = async () => {
    if (!pharmacistId) {
      alert('ログイン情報が取得できません。再度ログインしてください。');
      router.push('/pharmacist/login');
      return;
    }

    // バリデーション
    if (!applicationForm.nearestStation.trim()) {
      alert('最寄駅を入力してください');
      return;
    }

    if (applicationForm.workExperienceTypes.length === 0) {
      alert('勤務経験のある業態を最低1つ選択してください');
      return;
    }

    // 資格証明書の確認
    const verifiedCerts = certificates.filter(c => c.verificationStatus === 'verified');
    if (verifiedCerts.length === 0) {
      if (!confirm('資格証明書が未確認です。プロフィールページで証明書をアップロードしてください。\n\nそれでも応募しますか？')) {
        return;
      }
    }

    if (!confirm('この求人に応募しますか？')) {
      return;
    }

    setApplying(true);
    try {
      console.log('[Debug] Submitting application:', {
        jobPostingId: jobId,
        pharmacistId,
        nearestStation: applicationForm.nearestStation,
        workExperienceTypes: applicationForm.workExperienceTypes,
        workExperienceTypesLength: applicationForm.workExperienceTypes.length,
      });

      const response = await applicationsAPI.create({
        jobPostingId: jobId,
        pharmacistId,
        nearestStation: applicationForm.nearestStation,
        workExperienceTypes: applicationForm.workExperienceTypes,
        coverLetter: applicationForm.coverLetter || undefined,
      });

      if (response.success) {
        alert('応募が完了しました');
        router.push('/pharmacist/applications');
      }
    } catch (error: any) {
      console.error('Failed to apply:', error);
      alert(error.response?.data?.error || '応募に失敗しました');
    } finally {
      setApplying(false);
    }
  };

  const toggleWorkExperienceType = (type: string) => {
    setApplicationForm(prev => ({
      ...prev,
      workExperienceTypes: prev.workExperienceTypes.includes(type)
        ? prev.workExperienceTypes.filter(t => t !== type)
        : [...prev.workExperienceTypes, type],
    }));
  };

  // 薬局プロフィールを取得
  const handleViewPharmacyDetail = async () => {
    if (!job?.pharmacyId) return;
    
    setLoadingPharmacyProfile(true);
    setShowPharmacyModal(true);
    try {
      const response = await pharmacyAPI.getPublicProfile(job.pharmacyId);
      if (response.success && response.data) {
        setPharmacyProfile(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch pharmacy profile:', error);
      alert('薬局情報の取得に失敗しました');
    } finally {
      setLoadingPharmacyProfile(false);
    }
  };

  // 時刻フォーマット（HH:MM形式）
  const formatTime = (timeString?: string) => {
    if (!timeString) return '未設定';
    // すでにHH:MM形式の場合はそのまま返す
    if (typeof timeString === 'string' && /^\d{2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    // DateTime形式の場合は変換
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return '未設定';
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 日付フォーマット
  const formatDate = (dateString?: string) => {
    if (!dateString) return '未設定';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  if (loading) {
    return (
      <ProtectedRoute requiredUserType="pharmacist">
        <PharmacistLayout title="求人詳細">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        </PharmacistLayout>
      </ProtectedRoute>
    );
  }

  if (!job) {
    return (
      <ProtectedRoute requiredUserType="pharmacist">
        <PharmacistLayout title="求人詳細">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">求人が見つかりません</div>
          </div>
        </PharmacistLayout>
      </ProtectedRoute>
    );
  }

  // 両方の証明書（薬剤師免許証と保険薬剤師登録票）が承認済みかチェック
  const licenseCert = certificates.find(c => c.certificateType === 'license');
  const registrationCert = certificates.find(c => c.certificateType === 'registration');
  const hasVerifiedLicense = licenseCert?.verificationStatus === 'verified';
  const hasVerifiedRegistration = registrationCert?.verificationStatus === 'verified';
  const hasVerifiedCertificate = hasVerifiedLicense && hasVerifiedRegistration;

  console.log('[Debug] Profile verification:', {
    profile: profile ? { id: profile.id, verificationStatus: profile.verificationStatus } : null,
    licenseCert: licenseCert ? { id: licenseCert.id, status: licenseCert.verificationStatus } : null,
    registrationCert: registrationCert ? { id: registrationCert.id, status: registrationCert.verificationStatus } : null,
    hasVerifiedLicense,
    hasVerifiedRegistration,
    hasVerifiedCertificate,
  });

  return (
    <ProtectedRoute requiredUserType="pharmacist">
      <PharmacistLayout title="求人詳細">
        <div className="space-y-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/pharmacist/jobs"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </Link>
            </div>
            <button
              onClick={() => setShowApplicationDialog(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Send size={20} />
              応募する
            </button>
          </div>

          {/* 資格証明書の警告 */}
          {!hasVerifiedCertificate && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-900">
                    資格証明書が未確認です
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    応募前に資格証明書をアップロードすることを強く推奨します。
                    <Link href="/pharmacist/profile" className="underline ml-1">
                      プロフィールページへ
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 基本情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{job.title}</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin size={20} className="text-blue-600" />
                <span>{job.workLocation || '場所未設定'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign size={20} className="text-green-600" />
                <span className="font-semibold text-lg">¥{job.dailyWage.toLocaleString()} / 日</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={20} className="text-purple-600" />
                <span>{job.desiredWorkDays || 0}日間</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock size={20} className="text-orange-600" />
                <span>{job.desiredWorkHours || '応相談'}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-1">募集期限</p>
              <p className="font-medium">
                {job.recruitmentDeadline ? format(new Date(job.recruitmentDeadline), 'yyyy年MM月dd日（E）', { locale: ja }) : '未設定'}
              </p>
            </div>
          </div>

          {/* 報酬・勤務条件 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">報酬・勤務条件</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">日給</p>
                <p className="font-medium text-lg">¥{job.dailyWage.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">勤務日数</p>
                <p className="font-medium">{job.desiredWorkDays || 0}日間</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">報酬総額（目安）</p>
                <p className="font-medium text-lg text-green-600">¥{((job.dailyWage * (job.desiredWorkDays || 0))).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">希望勤務時間</p>
                <p className="font-medium">{job.desiredWorkHours || '応相談'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">勤務開始可能期間</p>
                <p className="font-medium">
                  {job.workStartPeriodFrom && job.workStartPeriodTo ? (
                    <>
                      {format(new Date(job.workStartPeriodFrom), 'yyyy/MM/dd', { locale: ja })} 〜
                      {format(new Date(job.workStartPeriodTo), 'yyyy/MM/dd', { locale: ja })}
                    </>
                  ) : '未設定'}
                </p>
              </div>
            </div>
          </div>

          {/* 薬局情報 */}
          {job.pharmacyId && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">🏥 薬局情報</h3>
                <button
                  onClick={handleViewPharmacyDetail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Building2 size={16} />
                  薬局の詳細を見る
                  <ChevronRight size={16} />
                </button>
              </div>
              {job.pharmacy && (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">薬局名</p>
                    <p className="font-medium">{job.pharmacy.pharmacyName || '薬局情報なし'}</p>
                  </div>
                  {job.pharmacy.prefecture && (
                    <div>
                      <p className="text-sm text-gray-600">都道府県</p>
                      <p className="font-medium">{job.pharmacy.prefecture}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 求人詳細 */}
          {job.description && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">求人詳細</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {/* 応募条件 */}
          {job.requirements && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">応募条件・その他</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}

          {/* 勤務地情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">勤務地情報</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">勤務地</p>
                <p className="font-medium">{job.workLocation || '場所未設定'}</p>
              </div>
            </div>
          </div>

          {/* 応募ボタン（下部） */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowApplicationDialog(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-lg"
            >
              <Send size={24} />
              この求人に応募する
            </button>
          </div>
        </div>

        {/* 応募フォーム - モーダル形式 */}
        {showApplicationDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
              <div className="p-8">
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-8 border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-900">応募情報の入力</h2>
                  <button
                    onClick={() => setShowApplicationDialog(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* 資格証明書の警告 */}
                {!hasVerifiedCertificate && (
                  <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-orange-900">
                          ⚠️ 資格証明書が未確認です
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                          応募前に薬剤師免許証と保険薬剤師登録票をアップロードすることを強く推奨します。
                          <Link href="/pharmacist/profile" className="underline ml-1" target="_blank">
                            プロフィールページで確認
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 求人情報の確認 */}
                <div className="mb-8 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">応募先求人</h4>
                  <p className="font-medium text-lg">{job.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    日給: ¥{job.dailyWage.toLocaleString()} × {job.desiredWorkDays || 0}日 = ¥{(job.dailyWage * (job.desiredWorkDays || 0)).toLocaleString()}
                  </p>
                </div>

                {/* 基本情報セクション */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">基本情報</h3>

                  <div className="grid grid-cols-2 gap-6">
                    {/* 最寄駅 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        最寄駅 <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={applicationForm.nearestStation}
                        onChange={(e) => setApplicationForm({
                          ...applicationForm,
                          nearestStation: e.target.value
                        })}
                        placeholder="例: 新宿駅"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        bg-white text-gray-900"
                      />
                    </div>

                    {/* 空のスペース（2カラムレイアウトを維持） */}
                    <div></div>
                  </div>
                </div>

                {/* 経歴セクション */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">経歴</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      勤務経験のある業態 <span className="text-red-600">*</span>
                    </label>

                    {/* チェックボックスグループ */}
                    <div className="space-y-2">
                      {['調剤薬局', 'ドラッグストア', '病院薬剤部', '製薬企業', 'その他'].map((type) => (
                        <label
                          key={type}
                          className={`flex items-center gap-3 p-3 border rounded-lg 
                          cursor-pointer hover:bg-gray-50 transition-colors ${applicationForm.workExperienceTypes.includes(type)
                              ? 'bg-blue-50 border-blue-500'
                              : 'border-gray-300'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={applicationForm.workExperienceTypes.includes(type)}
                            onChange={() => toggleWorkExperienceType(type)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                            focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-900">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 自己紹介セクション */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">自己紹介・アピールポイント</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      意気込み・自己PR <span className="text-gray-500 text-xs">(任意)</span>
                    </label>
                    <textarea
                      value={applicationForm.coverLetter}
                      onChange={(e) => setApplicationForm({
                        ...applicationForm,
                        coverLetter: e.target.value
                      })}
                      placeholder="調剤薬局での経験やスキル、応募動機などを記載してください"
                      rows={6}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      bg-white text-gray-900 resize-none"
                    />
                  </div>
                </div>

                {/* 注意事項 */}
                <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">⚠️ 注意事項</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• 応募後、薬局からメッセージが届く場合があります</li>
                    <li>• やむを得ずキャンセルが必要な場合は、運営（support@yakunavi.jp）までご連絡ください</li>
                    <li>• 入力内容は薬局側に開示されます</li>
                    <li>• 虚偽の情報を記載した場合、契約が取り消される場合があります</li>
                  </ul>
                </div>

                {/* ボタン */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    onClick={() => setShowApplicationDialog(false)}
                    disabled={applying}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg 
                    hover:bg-gray-50 transition-colors font-medium"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={applying || !applicationForm.nearestStation.trim() ||
                      applicationForm.workExperienceTypes.length === 0}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg 
                    hover:bg-blue-700 transition-colors disabled:bg-gray-300 
                    disabled:cursor-not-allowed font-medium"
                  >
                    {applying ? '応募中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 薬局詳細モーダル */}
        {showPharmacyModal && job.pharmacyId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {pharmacyProfile?.pharmacyName || job.pharmacy?.pharmacyName || '薬局'} のプロフィール
                </h2>
                <button
                  onClick={() => {
                    setShowPharmacyModal(false);
                    setPharmacyProfile(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {loadingPharmacyProfile ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">読み込み中...</div>
                  </div>
                ) : pharmacyProfile ? (
                  <>
                    {/* 連絡先情報 */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">連絡先情報</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {pharmacyProfile.phoneNumber && (
                          <div>
                            <p className="text-sm text-gray-600">電話番号</p>
                            <p className="font-medium">
                              <a href={`tel:${pharmacyProfile.phoneNumber}`} className="text-blue-600 hover:underline">
                                {pharmacyProfile.phoneNumber}
                              </a>
                            </p>
                          </div>
                        )}
                        {pharmacyProfile.faxNumber && (
                          <div>
                            <p className="text-sm text-gray-600">FAX番号</p>
                            <p className="font-medium">{pharmacyProfile.faxNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 基本情報 */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">基本情報</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">薬局名</p>
                          <p className="font-medium">{pharmacyProfile.pharmacyName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">都道府県</p>
                          <p className="font-medium">{pharmacyProfile.prefecture || '未記入'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">住所</p>
                          <p className="font-medium">{pharmacyProfile.address || '未記入'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">最寄駅</p>
                          <p className="font-medium">{pharmacyProfile.nearestStation || '未記入'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">設立日</p>
                          <p className="font-medium">{formatDate(pharmacyProfile.establishedDate)}</p>
                        </div>
                      </div>
                    </div>

                    {/* 代表者情報 */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">代表者情報</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">代表者名</p>
                          <p className="font-medium">
                            {pharmacyProfile.representativeLastName} {pharmacyProfile.representativeFirstName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 営業情報 */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">営業情報</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">営業時間</p>
                          <p className="font-medium">
                            {pharmacyProfile.businessHoursStart && pharmacyProfile.businessHoursEnd
                              ? `${formatTime(pharmacyProfile.businessHoursStart)} - ${formatTime(pharmacyProfile.businessHoursEnd)}`
                              : '未設定'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">1日の処方箋数</p>
                          <p className="font-medium">
                            {pharmacyProfile.dailyPrescriptionCount
                              ? `${pharmacyProfile.dailyPrescriptionCount}件`
                              : '未記入'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">スタッフ数</p>
                          <p className="font-medium">
                            {pharmacyProfile.staffCount ? `${pharmacyProfile.staffCount}人` : '未記入'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 薬局情報 */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">薬局情報</h3>
                      <div className="space-y-3">
                        {pharmacyProfile.introduction && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">紹介文</p>
                            <p className="font-medium whitespace-pre-wrap">{pharmacyProfile.introduction}</p>
                          </div>
                        )}
                        {pharmacyProfile.strengths && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">強み</p>
                            <p className="font-medium whitespace-pre-wrap">{pharmacyProfile.strengths}</p>
                          </div>
                        )}
                        {pharmacyProfile.equipmentSystems && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">設備・システム</p>
                            <p className="font-medium whitespace-pre-wrap">{pharmacyProfile.equipmentSystems}</p>
                          </div>
                        )}
                        {!pharmacyProfile.introduction &&
                          !pharmacyProfile.strengths &&
                          !pharmacyProfile.equipmentSystems && (
                            <p className="text-sm text-gray-500">未記入</p>
                          )}
                      </div>
                    </div>

                    {/* 求人情報 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">求人情報</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">求人タイトル</p>
                          <p className="font-medium">{job.title}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">日給</p>
                          <p className="font-medium">¥{job.dailyWage.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">薬局情報の取得に失敗しました</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </PharmacistLayout>
    </ProtectedRoute>
  );
}

