'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Calendar, Users, FileText } from 'lucide-react';

interface Pharmacy {
  id: number;
  userId: number;
  pharmacyName: string;
  companyName?: string;
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
}

export default function PharmacyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pharmacyId = params.id;

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pharmacyId) {
      fetchPharmacyDetail();
    }
  }, [pharmacyId]);

  const fetchPharmacyDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/pharmacies/${pharmacyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('薬局情報の取得に失敗しました');
      }

      const data = await response.json();
      setPharmacy(data.data);
    } catch (err: any) {
      console.error('Failed to fetch pharmacy detail:', err);
      setError(err.message || '薬局情報の取得に失敗しました');
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/admin/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!pharmacy) return;

    const action = pharmacy.isActive ? '停止' : '有効化';
    if (!confirm(`この薬局アカウントを${action}しますか？`)) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${pharmacy.userId}/toggle-status`, {
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
      fetchPharmacyDetail();
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      alert(err.message || 'ステータスの更新に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !pharmacy) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">{error || '薬局が見つかりません'}</p>
          <button
            onClick={() => router.push('/admin/pharmacies')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← 薬局一覧に戻る
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
          onClick={() => router.push('/admin/pharmacies')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          薬局一覧に戻る
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">薬局詳細</h1>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                pharmacy.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {pharmacy.isActive ? 'アクティブ' : '停止中'}
            </span>
            <button
              onClick={handleToggleStatus}
              className={`px-4 py-2 rounded-md font-medium ${
                pharmacy.isActive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {pharmacy.isActive ? 'アカウント停止' : 'アカウント有効化'}
            </button>
          </div>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            基本情報
          </h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">薬局ID</label>
              <p className="text-gray-900">#{pharmacy.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">ユーザーID</label>
              <p className="text-gray-900">#{pharmacy.userId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">薬局名</label>
              <p className="text-gray-900 font-semibold text-lg">{pharmacy.pharmacyName || pharmacy.companyName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">代表者</label>
              <p className="text-gray-900">
                {pharmacy.representativeLastName} {pharmacy.representativeFirstName}
              </p>
            </div>
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">メールアドレス</label>
                <p className="text-gray-900">{pharmacy.email}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">電話番号</label>
                <p className="text-gray-900">{pharmacy.phoneNumber}</p>
              </div>
            </div>
            {pharmacy.faxNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">FAX番号</label>
                <p className="text-gray-900">{pharmacy.faxNumber}</p>
              </div>
            )}
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">住所</label>
                <p className="text-gray-900">
                  {pharmacy.prefecture} {pharmacy.address}
                </p>
              </div>
            </div>
            {pharmacy.nearestStation && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">最寄駅</label>
                <p className="text-gray-900">{pharmacy.nearestStation}</p>
              </div>
            )}
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">設立日</label>
                <p className="text-gray-900">
                  {pharmacy.establishedDate
                    ? new Date(pharmacy.establishedDate).toLocaleDateString('ja-JP')
                    : '未設定'}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">登録日</label>
              <p className="text-gray-900">
                {new Date(pharmacy.createdAt).toLocaleString('ja-JP')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 薬局情報 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            薬局情報
          </h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <Users className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">スタッフ数</label>
                <p className="text-gray-900">{pharmacy.staffCount || '未設定'}人</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">1日処方箋数</label>
              <p className="text-gray-900">{pharmacy.dailyPrescriptionCount || '未設定'}枚</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">営業時間</label>
              <p className="text-gray-900">
                {pharmacy.businessHoursStart && pharmacy.businessHoursEnd
                  ? `${pharmacy.businessHoursStart} 〜 ${pharmacy.businessHoursEnd}`
                  : '未設定'}
              </p>
            </div>
          </div>

          {pharmacy.introduction && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">紹介文</label>
              <p className="text-gray-900 whitespace-pre-wrap">{pharmacy.introduction}</p>
            </div>
          )}

          {pharmacy.strengths && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">強み・特徴</label>
              <p className="text-gray-900 whitespace-pre-wrap">{pharmacy.strengths}</p>
            </div>
          )}

          {pharmacy.equipmentSystems && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">設備・システム</label>
              <p className="text-gray-900 whitespace-pre-wrap">{pharmacy.equipmentSystems}</p>
            </div>
          )}
        </div>
      </div>

      {/* 今後の拡張: おためし案件一覧、契約一覧、ペナルティ情報など */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800 text-sm">
          💡 今後、おためし案件一覧、契約履歴、ペナルティ情報などの表示機能を追加予定です
        </p>
      </div>
    </div>
  );
}

