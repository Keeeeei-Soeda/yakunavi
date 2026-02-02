'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Award, Briefcase, FileText } from 'lucide-react';

interface Pharmacist {
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
  workExperienceTypes: string[];
  certifiedPharmacistLicense: boolean;
  otherLicenses: string[];
  specialtyAreas: string[];
  selfIntroduction: string;
  isActive: boolean;
  createdAt: string;
  applicationCount: number;
  contractCount: number;
}

export default function PharmacistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pharmacistId = params.id;

  const [pharmacist, setPharmacist] = useState<Pharmacist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pharmacistId) {
      fetchPharmacistDetail();
    }
  }, [pharmacistId]);

  const fetchPharmacistDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/pharmacists/${pharmacistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('薬剤師情報の取得に失敗しました');
      }

      const data = await response.json();
      setPharmacist(data.data);
    } catch (err: any) {
      console.error('Failed to fetch pharmacist detail:', err);
      setError(err.message || '薬剤師情報の取得に失敗しました');
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/admin/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!pharmacist) return;

    const action = pharmacist.isActive ? '停止' : '有効化';
    if (!confirm(`この薬剤師アカウントを${action}しますか？`)) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${pharmacist.userId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('ステータスの更新に失敗しました');
      }

      alert(`アカウントを${action}しました`);
      fetchPharmacistDetail();
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      alert(err.message || 'ステータスの更新に失敗しました');
    }
  };

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ✓ 確認済み
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            ⏳ 確認待ち
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            ✗ 差し戻し
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !pharmacist) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">{error || '薬剤師が見つかりません'}</p>
          <button
            onClick={() => router.push('/admin/pharmacists')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← 薬剤師一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/pharmacists')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          薬剤師一覧に戻る
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">薬剤師詳細</h1>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                pharmacist.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {pharmacist.isActive ? 'アクティブ' : '停止中'}
            </span>
            <button
              onClick={handleToggleStatus}
              className={`px-4 py-2 rounded-md font-medium ${
                pharmacist.isActive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {pharmacist.isActive ? 'アカウント停止' : 'アカウント有効化'}
            </button>
          </div>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2" />
            基本情報
          </h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">薬剤師ID</label>
              <p className="text-gray-900">#{pharmacist.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">ユーザーID</label>
              <p className="text-gray-900">#{pharmacist.userId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">氏名</label>
              <p className="text-gray-900 font-semibold text-lg">
                {pharmacist.lastName} {pharmacist.firstName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">年齢</label>
              <p className="text-gray-900">{pharmacist.age ? `${pharmacist.age}歳` : '未設定'}</p>
            </div>
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">メールアドレス</label>
                <p className="text-gray-900">{pharmacist.email}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">電話番号</label>
                <p className="text-gray-900">{pharmacist.phoneNumber || '未設定'}</p>
              </div>
            </div>
            <div className="flex items-start md:col-span-2">
              <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">住所</label>
                <p className="text-gray-900">{pharmacist.address || '未設定'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">登録日</label>
                <p className="text-gray-900">
                  {new Date(pharmacist.createdAt).toLocaleString('ja-JP')}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">応募数 / 契約数</label>
              <p className="text-gray-900">
                {pharmacist.applicationCount}件 / {pharmacist.contractCount}件
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 資格情報 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            資格情報
          </h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">薬剤師免許番号</label>
              <p className="text-gray-900">{pharmacist.licenseNumber || '未設定'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">証明書ステータス</label>
              <div>{getVerificationStatusBadge(pharmacist.verificationStatus)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">免許取得年</label>
              <p className="text-gray-900">
                {pharmacist.licenseYear ? `${pharmacist.licenseYear}年` : '未設定'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">認定薬剤師</label>
              <p className="text-gray-900">
                {pharmacist.certifiedPharmacistLicense ? '✓ あり' : '✗ なし'}
              </p>
            </div>
            {pharmacist.otherLicenses && pharmacist.otherLicenses.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-2">その他の資格</label>
                <div className="flex flex-wrap gap-2">
                  {pharmacist.otherLicenses.map((license, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {license}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 経歴情報 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            経歴・経験
          </h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">出身大学</label>
              <p className="text-gray-900">{pharmacist.university || '未設定'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">卒業年</label>
              <p className="text-gray-900">
                {pharmacist.graduationYear ? `${pharmacist.graduationYear}年` : '未設定'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">実務経験</label>
              <p className="text-gray-900">
                {pharmacist.workExperienceYears || pharmacist.workExperienceMonths
                  ? `${pharmacist.workExperienceYears || 0}年${pharmacist.workExperienceMonths || 0}ヶ月`
                  : '未設定'}
              </p>
            </div>
            {pharmacist.workExperienceTypes && pharmacist.workExperienceTypes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">経験業態</label>
                <div className="flex flex-wrap gap-2">
                  {pharmacist.workExperienceTypes.map((type, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {pharmacist.specialtyAreas && pharmacist.specialtyAreas.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-2">専門分野</label>
                <div className="flex flex-wrap gap-2">
                  {pharmacist.specialtyAreas.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {pharmacist.selfIntroduction && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">自己紹介</label>
              <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                {pharmacist.selfIntroduction}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 今後の拡張: 応募履歴、契約履歴、証明書など */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800 text-sm">
          💡 今後、応募履歴、契約履歴、証明書の詳細などの表示機能を追加予定です
        </p>
      </div>
    </div>
  );
}

