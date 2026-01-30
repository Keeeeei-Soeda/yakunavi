'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { useAuthStore } from '@/lib/store/authStore';
import { pharmacyAPI, PharmacyProfile } from '@/lib/api/pharmacy';
import { Building2, Phone, MapPin, Clock, Users, FileText } from 'lucide-react';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const pharmacyId = user?.relatedId || 1;

  const [profile, setProfile] = useState<PharmacyProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<PharmacyProfile>>({});

  useEffect(() => {
    fetchProfile();
  }, [pharmacyId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await pharmacyAPI.getProfile(pharmacyId);
      if (response.success && response.data) {
        setProfile(response.data);
        setFormData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      alert('プロフィールの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await pharmacyAPI.updateProfile(pharmacyId, formData);
      if (response.success) {
        alert('プロフィールを更新しました');
        setProfile(response.data);
        setIsEditing(false);
        // サイドバーの薬局名を更新するためにリロード
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert(error.response?.data?.error || '更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '未設定';
    const date = new Date(timeString);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '未設定';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  if (loading) {
    return (
      <ProtectedRoute requiredUserType="pharmacy">
        <PharmacyLayout title="プロフィール管理">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        </PharmacyLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredUserType="pharmacy">
      <PharmacyLayout
        title={isEditing ? 'プロフィール編集' : 'プロフィール'}
        rightAction={
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                編集
              </button>
            )}
          </div>
        }
      >
        {isEditing ? (
          /* 編集モード */
          <div className="bg-white rounded-lg shadow p-8">
            <div className="space-y-8">
              {/* 基本情報 */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 size={20} />
                  基本情報
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      薬局名 *
                    </label>
                    <input
                      type="text"
                      value={formData.pharmacyName || ''}
                      onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      都道府県
                    </label>
                    <input
                      type="text"
                      value={formData.prefecture || ''}
                      onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      住所
                    </label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 代表者情報 */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users size={20} />
                  代表者情報
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      代表者姓 *
                    </label>
                    <input
                      type="text"
                      value={formData.representativeLastName || ''}
                      onChange={(e) => setFormData({ ...formData, representativeLastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      代表者名 *
                    </label>
                    <input
                      type="text"
                      value={formData.representativeFirstName || ''}
                      onChange={(e) => setFormData({ ...formData, representativeFirstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 連絡先情報 */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Phone size={20} />
                  連絡先情報
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      電話番号
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      FAX番号
                    </label>
                    <input
                      type="text"
                      value={formData.faxNumber || ''}
                      onChange={(e) => setFormData({ ...formData, faxNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 営業情報 */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock size={20} />
                  営業情報
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      営業開始時間
                    </label>
                    <input
                      type="time"
                      value={formData.businessHoursStart ? formatTime(formData.businessHoursStart) : ''}
                      onChange={(e) => setFormData({ ...formData, businessHoursStart: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      営業終了時間
                    </label>
                    <input
                      type="time"
                      value={formData.businessHoursEnd ? formatTime(formData.businessHoursEnd) : ''}
                      onChange={(e) => setFormData({ ...formData, businessHoursEnd: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      最寄り駅
                    </label>
                    <input
                      type="text"
                      value={formData.nearestStation || ''}
                      onChange={(e) => setFormData({ ...formData, nearestStation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      設立日
                    </label>
                    <input
                      type="date"
                      value={formData.establishedDate ? new Date(formData.establishedDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      1日の処方箋枚数
                    </label>
                    <input
                      type="number"
                      value={formData.dailyPrescriptionCount || ''}
                      onChange={(e) => setFormData({ ...formData, dailyPrescriptionCount: parseInt(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      スタッフ数
                    </label>
                    <input
                      type="number"
                      value={formData.staffCount || ''}
                      onChange={(e) => setFormData({ ...formData, staffCount: parseInt(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 薬局の紹介・特徴 */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  薬局の紹介・特徴
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      薬局の紹介
                    </label>
                    <textarea
                      rows={4}
                      value={formData.introduction || ''}
                      onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                      placeholder="薬局の特徴や雰囲気を説明してください"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      強み・特色
                    </label>
                    <textarea
                      rows={3}
                      value={formData.strengths || ''}
                      onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                      placeholder="在宅医療、かかりつけ薬剤師など"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      設備・システム
                    </label>
                    <textarea
                      rows={3}
                      value={formData.equipmentSystems || ''}
                      onChange={(e) => setFormData({ ...formData, equipmentSystems: e.target.value })}
                      placeholder="電子薬歴システム、調剤機器など"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 表示モード */
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 size={40} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {profile?.pharmacyName || '未設定'}
                </h2>
                <p className="text-gray-600">
                  {profile?.prefecture || ''}{profile?.address ? ` ${profile.address}` : ''}
                </p>
                <p className="text-gray-600">
                  代表者: {profile?.representativeLastName} {profile?.representativeFirstName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Phone size={18} />
                  連絡先情報
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-500 w-32">電話番号:</span>
                    <span className="text-gray-900">{profile?.phoneNumber || '未設定'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">FAX番号:</span>
                    <span className="text-gray-900">{profile?.faxNumber || '未設定'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock size={18} />
                  営業情報
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-500 w-32">営業時間:</span>
                    <span className="text-gray-900">
                      {profile?.businessHoursStart && profile?.businessHoursEnd
                        ? `${formatTime(profile.businessHoursStart)} - ${formatTime(profile.businessHoursEnd)}`
                        : '未設定'}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">設立:</span>
                    <span className="text-gray-900">{formatDate(profile?.establishedDate)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin size={18} />
                  アクセス
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-500 w-32">最寄り駅:</span>
                    <span className="text-gray-900">{profile?.nearestStation || '未設定'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users size={18} />
                  薬局規模
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-500 w-32">処方箋枚数:</span>
                    <span className="text-gray-900">
                      {profile?.dailyPrescriptionCount ? `約${profile.dailyPrescriptionCount}枚/日` : '未設定'}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">スタッフ数:</span>
                    <span className="text-gray-900">
                      {profile?.staffCount ? `${profile.staffCount}名` : '未設定'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText size={18} />
                  薬局の紹介
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {profile?.introduction || '薬局の紹介は登録されていません'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">強み・特色</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {profile?.strengths || '登録されていません'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">設備・システム</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {profile?.equipmentSystems || '登録されていません'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </PharmacyLayout>
    </ProtectedRoute>
  );
}
