'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, Calendar, FileText, CheckCircle } from 'lucide-react';
import { getPaymentById } from '@/lib/api/admin';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface PaymentDetail {
  id: number;
  contractId: number;
  pharmacyId: number;
  amount: number;
  paymentStatus: string;
  transferName: string;
  reportedAt: string;
  confirmedAt: string;
  createdAt: string;
  contract: {
    id: number;
    initialWorkDate: string;
    workDays: number;
    dailyWage: number;
    totalCompensation: number;
    platformFee: number;
    workHours: string;
    status: string;
    jobPosting: {
      id: number;
      title: string;
    };
  };
  pharmacy: {
    id: number;
    userId: number;
    pharmacyName: string;
    representativeLastName: string;
    representativeFirstName: string;
    email: string;
    phoneNumber: string;
    faxNumber: string;
    prefecture: string;
    address: string;
    nearestStation: string;
    establishedDate: string;
    dailyPrescriptionCount: number;
    staffCount: number;
    businessHoursStart: string;
    businessHoursEnd: string;
    introduction: string;
    strengths: string;
    equipmentSystems: string;
    isActive: boolean;
    createdAt: string;
  };
  pharmacist: {
    id: number;
    userId: number;
    lastName: string;
    firstName: string;
    email: string;
    phoneNumber: string;
    address: string;
    licenseNumber: string;
    verificationStatus: string;
    age: number;
    university: string;
    graduationYear: number;
    licenseYear: number;
    workExperienceYears: number;
    workExperienceMonths: number;
    createdAt: string;
  };
}

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id;

  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetail();
    }
  }, [paymentId]);

  const fetchPaymentDetail = async () => {
    try {
      setLoading(true);
      const response = await getPaymentById(Number(paymentId));
      if (response.success && response.data) {
        setPayment(response.data);
      } else {
        setError('支払い情報の取得に失敗しました');
      }
    } catch (err: any) {
      console.error('Failed to fetch payment detail:', err);
      setError(err.message || '支払い情報の取得に失敗しました');
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/admin/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      reported: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: '⏳ 未払い',
      reported: '📝 報告済み',
      confirmed: '✅ 確認済み',
      failed: '❌ 確認失敗',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">{error || '支払い情報が見つかりません'}</p>
          <button
            onClick={() => router.push('/admin/payments')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← 支払い一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* ヘッダー */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/payments')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          支払い一覧に戻る
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">支払い詳細</h1>
          <div className="flex items-center gap-2">
            {getStatusBadge(payment.paymentStatus)}
          </div>
        </div>
      </div>

      {/* 支払い情報 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            支払い情報
          </h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">支払いID</label>
              <p className="text-gray-900">#{payment.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">契約ID</label>
              <p className="text-gray-900">#{payment.contractId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">支払い金額</label>
              <p className="text-gray-900 font-semibold text-lg">{formatAmount(payment.amount)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">振込名義人</label>
              <p className="text-gray-900">{payment.transferName || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">報告日</label>
              <p className="text-gray-900">{formatDateTime(payment.reportedAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">確認日</label>
              <p className="text-gray-900">{formatDateTime(payment.confirmedAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">作成日</label>
              <p className="text-gray-900">{formatDateTime(payment.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 契約情報 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            契約情報
          </h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">求人タイトル</label>
              <p className="text-gray-900">{payment.contract.jobPosting.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">初回出勤日</label>
              <p className="text-gray-900">{formatDate(payment.contract.initialWorkDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">勤務日数</label>
              <p className="text-gray-900">{payment.contract.workDays}日</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">日給</label>
              <p className="text-gray-900">{formatAmount(payment.contract.dailyWage)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">報酬総額</label>
              <p className="text-gray-900 font-semibold">{formatAmount(payment.contract.totalCompensation)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">プラットフォーム手数料</label>
              <p className="text-gray-900">{formatAmount(payment.contract.platformFee)}</p>
            </div>
            {payment.contract.workHours && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">勤務時間</label>
                <p className="text-gray-900">{payment.contract.workHours}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">契約ステータス</label>
              <p className="text-gray-900">{payment.contract.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 薬局情報 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            薬局情報
          </h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">薬局ID</label>
              <p className="text-gray-900">#{payment.pharmacy.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">ユーザーID</label>
              <p className="text-gray-900">#{payment.pharmacy.userId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">薬局名</label>
              <p className="text-gray-900 font-semibold text-lg">{payment.pharmacy.pharmacyName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">代表者</label>
              <p className="text-gray-900">
                {payment.pharmacy.representativeLastName} {payment.pharmacy.representativeFirstName}
              </p>
            </div>
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">メールアドレス</label>
                <p className="text-gray-900">{payment.pharmacy.email}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">電話番号</label>
                <p className="text-gray-900">{payment.pharmacy.phoneNumber || '-'}</p>
              </div>
            </div>
            {payment.pharmacy.faxNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">FAX番号</label>
                <p className="text-gray-900">{payment.pharmacy.faxNumber}</p>
              </div>
            )}
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">住所</label>
                <p className="text-gray-900">
                  {payment.pharmacy.prefecture} {payment.pharmacy.address}
                </p>
              </div>
            </div>
            {payment.pharmacy.nearestStation && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">最寄駅</label>
                <p className="text-gray-900">{payment.pharmacy.nearestStation}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">スタッフ数</label>
              <p className="text-gray-900">{payment.pharmacy.staffCount || '未設定'}人</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">1日処方箋数</label>
              <p className="text-gray-900">{payment.pharmacy.dailyPrescriptionCount || '未設定'}枚</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">営業時間</label>
              <p className="text-gray-900">
                {payment.pharmacy.businessHoursStart && payment.pharmacy.businessHoursEnd
                  ? `${payment.pharmacy.businessHoursStart} 〜 ${payment.pharmacy.businessHoursEnd}`
                  : '未設定'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">アカウントステータス</label>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  payment.pharmacy.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {payment.pharmacy.isActive ? 'アクティブ' : '停止中'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 薬剤師情報 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2" />
            薬剤師情報
          </h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">薬剤師ID</label>
              <p className="text-gray-900">#{payment.pharmacist.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">ユーザーID</label>
              <p className="text-gray-900">#{payment.pharmacist.userId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">氏名</label>
              <p className="text-gray-900 font-semibold text-lg">
                {payment.pharmacist.lastName} {payment.pharmacist.firstName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">年齢</label>
              <p className="text-gray-900">{payment.pharmacist.age ? `${payment.pharmacist.age}歳` : '未設定'}</p>
            </div>
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">メールアドレス</label>
                <p className="text-gray-900">{payment.pharmacist.email}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">電話番号</label>
                <p className="text-gray-900">{payment.pharmacist.phoneNumber || '未設定'}</p>
              </div>
            </div>
            <div className="flex items-start md:col-span-2">
              <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">住所</label>
                <p className="text-gray-900">{payment.pharmacist.address || '未設定'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">薬剤師免許番号</label>
              <p className="text-gray-900">{payment.pharmacist.licenseNumber || '未設定'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">証明書ステータス</label>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  payment.pharmacist.verificationStatus === 'verified'
                    ? 'bg-green-100 text-green-800'
                    : payment.pharmacist.verificationStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {payment.pharmacist.verificationStatus === 'verified'
                  ? '✓ 確認済み'
                  : payment.pharmacist.verificationStatus === 'pending'
                    ? '⏳ 確認待ち'
                    : '✗ 差し戻し'}
              </span>
            </div>
            {payment.pharmacist.university && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">出身大学</label>
                <p className="text-gray-900">{payment.pharmacist.university}</p>
              </div>
            )}
            {payment.pharmacist.graduationYear && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">卒業年</label>
                <p className="text-gray-900">{payment.pharmacist.graduationYear}年</p>
              </div>
            )}
            {payment.pharmacist.licenseYear && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">免許取得年</label>
                <p className="text-gray-900">{payment.pharmacist.licenseYear}年</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">実務経験</label>
              <p className="text-gray-900">
                {payment.pharmacist.workExperienceYears || payment.pharmacist.workExperienceMonths
                  ? `${payment.pharmacist.workExperienceYears || 0}年${payment.pharmacist.workExperienceMonths || 0}ヶ月`
                  : '未設定'}
              </p>
            </div>
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">登録日</label>
                <p className="text-gray-900">
                  {formatDateTime(payment.pharmacist.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

