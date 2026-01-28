'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { useAuthStore } from '@/lib/store/authStore';
import { contractsAPI } from '@/lib/api/contracts';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  UserCircle,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Briefcase,
  Award,
  FileText,
  ChevronRight,
  X,
} from 'lucide-react';

interface HiredPharmacist {
  contractId: number;
  pharmacist: {
    id: number;
    lastName: string;
    firstName: string;
    phoneNumber: string | null;
    email: string;
    age: number | null;
    university: string | null;
    graduationYear: number | null;
    licenseYear: number | null;
    certifiedPharmacistLicense: string | null;
    otherLicenses: string | null;
    workExperienceYears: number | null;
    workExperienceMonths: number | null;
    workExperienceTypes: string[] | null;
    mainDuties: string[] | null;
    specialtyAreas: string[] | null;
    pharmacySystems: string[] | null;
    specialNotes: string | null;
    selfIntroduction: string | null;
  };
  jobPosting: {
    id: number;
    title: string;
  };
  application: {
    id: number;
    appliedAt: string;
    nearestStation: string | null;
    workExperienceTypes: string[] | null;
    coverLetter: string | null;
  };
  paymentConfirmedAt: string | null;
  contractCreatedAt: string;
}

export default function PharmacistProfilesPage() {
  const user = useAuthStore((state) => state.user);
  const pharmacyId = user?.relatedId || 1;

  const [pharmacists, setPharmacists] = useState<HiredPharmacist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPharmacist, setSelectedPharmacist] = useState<HiredPharmacist | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchHiredPharmacists();
  }, [pharmacyId]);

  const fetchHiredPharmacists = async () => {
    setLoading(true);
    try {
      const response = await contractsAPI.getHiredPharmacists(pharmacyId);
      if (response.success && response.data) {
        setPharmacists(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch hired pharmacists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (pharmacist: HiredPharmacist) => {
    setSelectedPharmacist(pharmacist);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <ProtectedRoute requiredUserType="pharmacy">
        <PharmacyLayout title="採用薬剤師のプロフィール">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        </PharmacyLayout>
      </ProtectedRoute>
    );
  }

  if (pharmacists.length === 0) {
    return (
      <ProtectedRoute requiredUserType="pharmacy">
        <PharmacyLayout title="採用薬剤師のプロフィール">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-300 mb-6">
              <UserCircle size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              採用済み薬剤師がいません
            </h3>
            <p className="text-gray-500">
              採用が完了した薬剤師のプロフィールがここに表示されます
            </p>
          </div>
        </PharmacyLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredUserType="pharmacy">
      <PharmacyLayout title="採用薬剤師のプロフィール">
        <div className="space-y-4">
          {pharmacists.map((item) => (
            <div
              key={item.contractId}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCircle size={32} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {item.pharmacist.lastName} {item.pharmacist.firstName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.jobPosting.title}
                      </p>
                    </div>
                  </div>

                  {/* 基本情報 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {item.pharmacist.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-gray-700">{item.pharmacist.email}</span>
                      </div>
                    )}
                    {item.pharmacist.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-gray-700">{item.pharmacist.phoneNumber}</span>
                      </div>
                    )}
                    {item.pharmacist.age && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-700">{item.pharmacist.age}歳</span>
                      </div>
                    )}
                    {item.pharmacist.university && (
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap size={16} className="text-gray-400" />
                        <span className="text-gray-700">{item.pharmacist.university}</span>
                      </div>
                    )}
                  </div>

                  {/* 経歴サマリー */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.pharmacist.workExperienceYears !== null && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        経験年数: {item.pharmacist.workExperienceYears}年
                        {item.pharmacist.workExperienceMonths !== null &&
                          item.pharmacist.workExperienceMonths > 0 &&
                          `${item.pharmacist.workExperienceMonths}ヶ月`}
                      </span>
                    )}
                    {item.pharmacist.mainDuties &&
                      item.pharmacist.mainDuties.slice(0, 3).map((duty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {duty}
                        </span>
                      ))}
                  </div>

                  {/* 採用日 */}
                  <p className="text-xs text-gray-500">
                    採用日: {format(new Date(item.paymentConfirmedAt || item.contractCreatedAt), 'yyyy年MM月dd日', { locale: ja })}
                  </p>
                </div>

                <button
                  onClick={() => handleViewDetail(item)}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FileText size={16} />
                  詳細を見る
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 詳細モーダル */}
        {showDetailModal && selectedPharmacist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedPharmacist.pharmacist.lastName}{' '}
                  {selectedPharmacist.pharmacist.firstName} のプロフィール
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* 連絡先情報 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">連絡先情報</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">メールアドレス</p>
                      <p className="font-medium">{selectedPharmacist.pharmacist.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">電話番号</p>
                      <p className="font-medium">
                        {selectedPharmacist.pharmacist.phoneNumber || '未設定'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 基本情報 */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">基本情報</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">年齢</p>
                      <p className="font-medium">
                        {selectedPharmacist.pharmacist.age
                          ? `${selectedPharmacist.pharmacist.age}歳`
                          : '未記入'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">出身大学</p>
                      <p className="font-medium">
                        {selectedPharmacist.pharmacist.university || '未記入'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">卒業年</p>
                      <p className="font-medium">
                        {selectedPharmacist.pharmacist.graduationYear
                          ? `${selectedPharmacist.pharmacist.graduationYear}年`
                          : '未記入'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">薬剤師免許取得年</p>
                      <p className="font-medium">
                        {selectedPharmacist.pharmacist.licenseYear
                          ? `${selectedPharmacist.pharmacist.licenseYear}年`
                          : '未記入'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">最寄駅</p>
                      <p className="font-medium">
                        {selectedPharmacist.application.nearestStation || '未記入'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 資格情報 */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">資格情報</h3>
                  <div className="space-y-3">
                    {selectedPharmacist.pharmacist.certifiedPharmacistLicense && (
                      <div>
                        <p className="text-sm text-gray-600">認定薬剤師資格</p>
                        <p className="font-medium">
                          {selectedPharmacist.pharmacist.certifiedPharmacistLicense}
                        </p>
                      </div>
                    )}
                    {selectedPharmacist.pharmacist.otherLicenses && (
                      <div>
                        <p className="text-sm text-gray-600">その他の関連資格</p>
                        <p className="font-medium">
                          {selectedPharmacist.pharmacist.otherLicenses}
                        </p>
                      </div>
                    )}
                    {!selectedPharmacist.pharmacist.certifiedPharmacistLicense &&
                      !selectedPharmacist.pharmacist.otherLicenses && (
                        <p className="text-sm text-gray-500">未記入</p>
                      )}
                  </div>
                </div>

                {/* 経歴 */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">経歴</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">勤務経験年数</p>
                      <p className="font-medium">
                        {selectedPharmacist.pharmacist.workExperienceYears !== null &&
                        selectedPharmacist.pharmacist.workExperienceMonths !== null
                          ? `${selectedPharmacist.pharmacist.workExperienceYears}年${
                              selectedPharmacist.pharmacist.workExperienceMonths > 0
                                ? `${selectedPharmacist.pharmacist.workExperienceMonths}ヶ月`
                                : ''
                            }`
                          : selectedPharmacist.pharmacist.workExperienceYears !== null
                            ? `${selectedPharmacist.pharmacist.workExperienceYears}年`
                            : '未記入'}
                      </p>
                    </div>
                    {selectedPharmacist.application.workExperienceTypes &&
                      selectedPharmacist.application.workExperienceTypes.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">勤務経験のある業態</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedPharmacist.application.workExperienceTypes.map(
                              (type, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                  {type}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    {selectedPharmacist.pharmacist.mainDuties &&
                      selectedPharmacist.pharmacist.mainDuties.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">主な業務経験</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedPharmacist.pharmacist.mainDuties.map((duty, index) => (
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
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">スキル・専門分野</h3>
                  <div className="space-y-3">
                    {selectedPharmacist.pharmacist.specialtyAreas &&
                      selectedPharmacist.pharmacist.specialtyAreas.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">得意な診療科・疾患領域</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedPharmacist.pharmacist.specialtyAreas.map((area, index) => (
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
                    {selectedPharmacist.pharmacist.pharmacySystems &&
                      selectedPharmacist.pharmacist.pharmacySystems.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">使用経験のある薬歴システム</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedPharmacist.pharmacist.pharmacySystems.map((system, index) => (
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
                    {selectedPharmacist.pharmacist.specialNotes && (
                      <div>
                        <p className="text-sm text-gray-600">特記事項</p>
                        <p className="font-medium">{selectedPharmacist.pharmacist.specialNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 自己紹介 */}
                {selectedPharmacist.application.coverLetter && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      自己紹介・アピールポイント
                    </h3>
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {selectedPharmacist.application.coverLetter}
                    </p>
                  </div>
                )}
                {selectedPharmacist.pharmacist.selfIntroduction && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">自己紹介</h3>
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {selectedPharmacist.pharmacist.selfIntroduction}
                    </p>
                  </div>
                )}

                {/* 契約情報 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">契約情報</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">求人</p>
                      <p className="font-medium">{selectedPharmacist.jobPosting.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">応募日</p>
                      <p className="font-medium">
                        {format(
                          new Date(selectedPharmacist.application.appliedAt),
                          'yyyy年MM月dd日',
                          { locale: ja }
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">採用日</p>
                      <p className="font-medium">
                        {format(
                          new Date(
                            selectedPharmacist.paymentConfirmedAt ||
                              selectedPharmacist.contractCreatedAt
                          ),
                          'yyyy年MM月dd日',
                          { locale: ja }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </PharmacyLayout>
    </ProtectedRoute>
  );
}
