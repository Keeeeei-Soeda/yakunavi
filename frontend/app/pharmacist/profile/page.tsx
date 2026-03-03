'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacistLayout } from '@/components/pharmacist/Layout';
import { useAuthStore } from '@/lib/store/authStore';
import {
    pharmacistProfileAPI,
    PharmacistProfile,
    Certificate,
} from '@/lib/api/pharmacist-profile';
import { PREFECTURES } from '@/lib/constants/prefectures';
import { Upload, X, CheckCircle, Clock, XCircle, User, Award, Briefcase, GraduationCap, FileText } from 'lucide-react';

export default function ProfilePage() {
    const user = useAuthStore((state) => state.user);
    const pharmacistId = user?.relatedId; // relatedIdがundefinedの可能性があるため、!を削除

    const [profile, setProfile] = useState<PharmacistProfile | null>(null);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false); // 条件分岐の前に移動（React Hooksのルール）

    const [formData, setFormData] = useState<Partial<PharmacistProfile>>({
        workExperienceTypes: [],
        mainDuties: [],
        specialtyAreas: [],
        pharmacySystems: [],
    });

    const fetchProfile = useCallback(async () => {
        if (!pharmacistId) {
            console.error('pharmacistId is not available');
            setLoading(false);
            return;
        }
        try {
            const response = await pharmacistProfileAPI.getProfile(pharmacistId);
            if (response.success && response.data) {
                setProfile(response.data);
                setFormData({
                    ...response.data,
                    workExperienceTypes: response.data.workExperienceTypes || [],
                    mainDuties: response.data.mainDuties || [],
                    specialtyAreas: response.data.specialtyAreas || [],
                    pharmacySystems: response.data.pharmacySystems || [],
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    }, [pharmacistId]);

    const fetchCertificates = useCallback(async () => {
        if (!pharmacistId) {
            console.error('pharmacistId is not available');
            return;
        }
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
        if (pharmacistId) {
            fetchProfile();
            fetchCertificates();
        } else {
            setLoading(false);
        }
    }, [pharmacistId, fetchProfile, fetchCertificates]);

    const handleSave = async () => {
        if (!pharmacistId) {
            alert('薬剤師IDが取得できませんでした。再度ログインしてください。');
            return;
        }
        setSaving(true);
        try {
            // 送信前に読み取り専用フィールドを除外
            const { id, userId, verificationStatus, verifiedAt, ...updateData } = formData as any;

            const response = await pharmacistProfileAPI.updateProfile(
                pharmacistId,
                updateData
            );
            if (response.success && response.data) {
                // 最新データで状態を更新
                setProfile(response.data);
                setFormData({
                    ...response.data,
                    workExperienceTypes: response.data.workExperienceTypes || [],
                    mainDuties: response.data.mainDuties || [],
                    specialtyAreas: response.data.specialtyAreas || [],
                    pharmacySystems: response.data.pharmacySystems || [],
                });
                alert('プロフィールを更新しました');
            }
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            alert(error.response?.data?.error || 'プロフィールの更新に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (
        certificateType: 'license' | 'registration',
        file: File
    ) => {
        if (!pharmacistId) {
            alert('薬剤師IDが取得できませんでした。再度ログインしてください。');
            return;
        }

        // ファイル形式のバリデーション
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/heic',
            'image/heif',
            'image/webp',
        ];
        if (!allowedTypes.includes(file.type)) {
            alert(
                '許可されていないファイル形式です。\n対応形式: PDF、JPEG、PNG、HEIC、HEIF、WebP'
            );
            return;
        }

        // ファイルサイズのバリデーション（10MB）
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert('ファイルサイズは10MB以下にしてください。');
            return;
        }

        setUploading(certificateType);
        try {
            const response = await pharmacistProfileAPI.uploadCertificate(
                pharmacistId,
                certificateType,
                file
            );
            if (response.success) {
                alert('証明書をアップロードしました');
                // 証明書一覧とプロフィールを再取得（検証ステータスが更新される可能性）
                await fetchCertificates();
                await fetchProfile();
            }
        } catch (error: any) {
            console.error('Failed to upload certificate:', error);
            alert(error.response?.data?.error || '証明書のアップロードに失敗しました');
        } finally {
            setUploading(null);
        }
    };

    const handleDeleteCertificate = async (certificateId: number) => {
        if (!pharmacistId) {
            alert('薬剤師IDが取得できませんでした。再度ログインしてください。');
            return;
        }
        if (!confirm('この証明書を削除しますか？')) return;

        try {
            const response = await pharmacistProfileAPI.deleteCertificate(
                pharmacistId,
                certificateId
            );
            if (response.success) {
                alert('証明書を削除しました');
                // 証明書一覧とプロフィールを再取得
                await fetchCertificates();
                await fetchProfile();
            }
        } catch (error: any) {
            console.error('Failed to delete certificate:', error);
            alert(error.response?.data?.error || '証明書の削除に失敗しました');
        }
    };

    const toggleArrayItem = (field: string, value: string) => {
        const currentArray = (formData[field as keyof typeof formData] as string[]) || [];
        const newArray = currentArray.includes(value)
            ? currentArray.filter((item) => item !== value)
            : [...currentArray, value];
        setFormData({ ...formData, [field]: newArray });
    };

    if (loading) {
        return (
            <ProtectedRoute requiredUserType="pharmacist">
                <PharmacistLayout title="プロフィール管理">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">読み込み中...</div>
                    </div>
                </PharmacistLayout>
            </ProtectedRoute>
        );
    }

    if (!pharmacistId) {
        return (
            <ProtectedRoute requiredUserType="pharmacist">
                <PharmacistLayout title="プロフィール管理">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-red-500">
                            エラー: 薬剤師IDが取得できませんでした。再度ログインしてください。
                        </div>
                    </div>
                </PharmacistLayout>
            </ProtectedRoute>
        );
    }

    const handleCancel = () => {
        if (profile) {
            setFormData({
                ...profile,
                workExperienceTypes: profile.workExperienceTypes || [],
                mainDuties: profile.mainDuties || [],
                specialtyAreas: profile.specialtyAreas || [],
                pharmacySystems: profile.pharmacySystems || [],
            });
        }
        setIsEditing(false);
    };

    const handleSaveAndExit = async () => {
        await handleSave();
        setIsEditing(false);
    };

    return (
        <ProtectedRoute requiredUserType="pharmacist">
            <PharmacistLayout
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
                                    onClick={handleSaveAndExit}
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
                    <div className="space-y-6">

                    {/* 証明書アップロード */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">📋 資格証明書</h2>
                        {(() => {
                            // 両方の証明書（薬剤師免許証と保険薬剤師登録票）が承認済みかチェック
                            const licenseCert = certificates.find(c => c.certificateType === 'license');
                            const registrationCert = certificates.find(c => c.certificateType === 'registration');
                            const hasVerifiedLicense = licenseCert?.verificationStatus === 'verified';
                            const hasVerifiedRegistration = registrationCert?.verificationStatus === 'verified';
                            const hasBothVerified = hasVerifiedLicense && hasVerifiedRegistration;

                            // 両方の証明書が承認済みの場合は警告を非表示
                            if (hasBothVerified) {
                                return null;
                            }

                            return (
                                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        ⚠️ 薬剤師免許証と保険薬剤師登録票をアップロードしてください。
                                        運営が確認後、求人への応募が可能になります。
                                    </p>
                                    <p className="text-xs text-yellow-700 mt-2">
                                        📎 対応形式: PDF、JPEG、PNG、HEIC、HEIF、WebP（最大10MB）
                                    </p>
                                </div>
                            );
                        })()}

                        <div className="space-y-6">
                            {/* 薬剤師免許証 */}
                            <div>
                                <h3 className="font-medium mb-2">薬剤師免許証</h3>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    {certificates
                                        .filter((c) => c.certificateType === 'license')
                                        .map((cert) => (
                                            <div
                                                key={cert.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    {cert.verificationStatus === 'verified' && (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    )}
                                                    {cert.verificationStatus === 'pending' && (
                                                        <Clock className="w-5 h-5 text-yellow-500" />
                                                    )}
                                                    {cert.verificationStatus === 'rejected' && (
                                                        <XCircle className="w-5 h-5 text-red-500" />
                                                    )}
                                                    <span className="text-sm">{cert.fileName}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteCertificate(cert.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}

                                    <div className="mt-2">
                                        <input
                                            type="file"
                                            accept="application/pdf,image/jpeg,image/png,image/heic,image/heif,image/webp"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload('license', file);
                                            }}
                                            className="hidden"
                                            id="license-upload"
                                            disabled={uploading === 'license'}
                                        />
                                        <label
                                            htmlFor="license-upload"
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            {uploading === 'license' ? 'アップロード中...' : 'アップロード'}
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PDF、JPEG、PNG、HEIC、HEIF、WebP形式に対応（最大10MB）
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 保険薬剤師登録票 */}
                            <div>
                                <h3 className="font-medium mb-2">保険薬剤師登録票</h3>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    {certificates
                                        .filter((c) => c.certificateType === 'registration')
                                        .map((cert) => (
                                            <div
                                                key={cert.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    {cert.verificationStatus === 'verified' && (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    )}
                                                    {cert.verificationStatus === 'pending' && (
                                                        <Clock className="w-5 h-5 text-yellow-500" />
                                                    )}
                                                    {cert.verificationStatus === 'rejected' && (
                                                        <XCircle className="w-5 h-5 text-red-500" />
                                                    )}
                                                    <span className="text-sm">{cert.fileName}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteCertificate(cert.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}

                                    <div className="mt-2">
                                        <input
                                            type="file"
                                            accept="application/pdf,image/jpeg,image/png,image/heic,image/heif,image/webp"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload('registration', file);
                                            }}
                                            className="hidden"
                                            id="registration-upload"
                                            disabled={uploading === 'registration'}
                                        />
                                        <label
                                            htmlFor="registration-upload"
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            {uploading === 'registration'
                                                ? 'アップロード中...'
                                                : 'アップロード'}
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PDF、JPEG、PNG、HEIC、HEIF、WebP形式に対応（最大10MB）
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 基本情報 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">基本情報</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    姓 *
                                </label>
                                <input
                                    type="text"
                                    value={formData.lastName || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, lastName: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    名 *
                                </label>
                                <input
                                    type="text"
                                    value={formData.firstName || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, firstName: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    電話番号
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phoneNumber: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    生年月日
                                </label>
                                <input
                                    type="date"
                                    value={
                                        formData.birthDate
                                            ? new Date(formData.birthDate).toISOString().split('T')[0]
                                            : ''
                                    }
                                    onChange={(e) =>
                                        setFormData({ ...formData, birthDate: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    年齢
                                </label>
                                <input
                                    type="number"
                                    value={formData.age || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, age: Number(e.target.value) })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    最寄駅 <span className="text-red-500">（応募時に必須）</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.nearestStation || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nearestStation: e.target.value })
                                    }
                                    placeholder="例: 天王寺駅、梅田駅"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    住所
                                </label>
                                <input
                                    type="text"
                                    value={formData.address || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 学歴 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">学歴</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    出身大学
                                </label>
                                <input
                                    type="text"
                                    value={formData.university || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, university: e.target.value })
                                    }
                                    placeholder="例: 大阪薬科大学"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    卒業年
                                </label>
                                <input
                                    type="number"
                                    value={formData.graduationYear || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            graduationYear: Number(e.target.value),
                                        })
                                    }
                                    placeholder="例: 2015"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 資格情報 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">資格情報</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    薬剤師免許番号
                                </label>
                                <input
                                    type="text"
                                    value={formData.licenseNumber || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, licenseNumber: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    薬剤師免許取得年
                                </label>
                                <input
                                    type="number"
                                    value={formData.licenseYear || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            licenseYear: Number(e.target.value),
                                        })
                                    }
                                    placeholder="例: 2015"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    認定薬剤師資格（あれば）
                                </label>
                                <input
                                    type="text"
                                    value={formData.certifiedPharmacistLicense || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            certifiedPharmacistLicense: e.target.value,
                                        })
                                    }
                                    placeholder="例: がん薬物療法認定薬剤師、糖尿病薬物療法認定薬剤師"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    その他の関連資格
                                </label>
                                <input
                                    type="text"
                                    value={formData.otherLicenses || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, otherLicenses: e.target.value })
                                    }
                                    placeholder="例: 登録販売者、栄養サポートチーム専門療法士"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 経歴 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">経歴</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        勤務歴（年数）
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.workExperienceYears || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                workExperienceYears: Number(e.target.value),
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        勤務歴（月数）
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.workExperienceMonths || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                workExperienceMonths: Number(e.target.value),
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    勤務経験のある業態{' '}
                                    <span className="text-red-500">（応募時に最低1つ必須）</span>
                                </label>
                                <div className="space-y-2">
                                    {['調剤薬局', 'ドラッグストア', '病院薬剤部', '製薬企業', 'その他'].map(
                                        (type) => (
                                            <label key={type} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.workExperienceTypes?.includes(type)}
                                                    onChange={() =>
                                                        toggleArrayItem('workExperienceTypes', type)
                                                    }
                                                    className="mr-2"
                                                />
                                                {type}
                                            </label>
                                        )
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    主な業務経験
                                </label>
                                <div className="space-y-2">
                                    {[
                                        '在宅医療',
                                        'かかりつけ薬剤師',
                                        'OTC販売',
                                        '服薬指導',
                                        '調剤業務',
                                        'その他',
                                    ].map((duty) => (
                                        <label key={duty} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.mainDuties?.includes(duty)}
                                                onChange={() => toggleArrayItem('mainDuties', duty)}
                                                className="mr-2"
                                            />
                                            {duty}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* スキル・専門分野 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">スキル・専門分野</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    得意な診療科・疾患領域
                                </label>
                                <div className="space-y-2">
                                    {[
                                        '循環器科',
                                        '糖尿病',
                                        'がん領域',
                                        '小児科',
                                        '精神科',
                                        '整形外科',
                                        'その他',
                                    ].map((area) => (
                                        <label key={area} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.specialtyAreas?.includes(area)}
                                                onChange={() => toggleArrayItem('specialtyAreas', area)}
                                                className="mr-2"
                                            />
                                            {area}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    使用経験のある薬歴システム
                                </label>
                                <div className="space-y-2">
                                    {[
                                        'Pharnes（ファーネス）',
                                        'Musubi（むすび）',
                                        '電子薬歴PharmaLink',
                                        'その他',
                                    ].map((system) => (
                                        <label key={system} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.pharmacySystems?.includes(system)}
                                                onChange={() => toggleArrayItem('pharmacySystems', system)}
                                                className="mr-2"
                                            />
                                            {system}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    特記事項
                                </label>
                                <textarea
                                    value={formData.specialNotes || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, specialNotes: e.target.value })
                                    }
                                    placeholder="例: 英語対応可、中国語対応可"
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 自己紹介 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">自己紹介・アピールポイント</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                自己紹介（最大500文字）
                            </label>
                            <textarea
                                value={formData.selfIntroduction || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, selfIntroduction: e.target.value })
                                }
                                placeholder="職歴、強み、応募動機など自由に記載してください"
                                rows={6}
                                maxLength={500}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.selfIntroduction?.length || 0} / 500文字
                            </p>
                        </div>
                    </div>

                    </div>
                ) : (
                    /* 表示モード */
                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <User size={32} className="text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">
                                    {profile?.lastName} {profile?.firstName}
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">
                                    {profile?.address || '住所未設定'}
                                </p>
                                {profile?.nearestStation && (
                                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                                        最寄駅: {profile.nearestStation}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 基本情報 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <User size={16} />
                                    基本情報
                                </h3>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-gray-500 flex-shrink-0 w-20">電話番号:</span>
                                        <span className="text-gray-900 truncate">{profile?.phoneNumber || '未設定'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-gray-500 flex-shrink-0 w-20">年齢:</span>
                                        <span className="text-gray-900 truncate">{profile?.age ? `${profile.age}歳` : '未設定'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-gray-500 flex-shrink-0 w-20">生年月日:</span>
                                        <span className="text-gray-900 truncate">
                                            {profile?.birthDate
                                                ? new Date(profile.birthDate).toLocaleDateString('ja-JP')
                                                : '未設定'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <Award size={16} />
                                    資格情報
                                </h3>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-gray-500 flex-shrink-0 w-20">免許番号:</span>
                                        <span className="text-gray-900 truncate">{profile?.licenseNumber || '未設定'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-gray-500 flex-shrink-0 w-20">免許取得年:</span>
                                        <span className="text-gray-900 truncate">
                                            {profile?.licenseYear ? `${profile.licenseYear}年` : '未設定'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-gray-500 flex-shrink-0 w-20">認定薬剤師:</span>
                                        <span className="text-gray-900 truncate">
                                            {profile?.certifiedPharmacistLicense || '未設定'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <GraduationCap size={16} />
                                    学歴
                                </h3>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-gray-500 flex-shrink-0 w-20">出身大学:</span>
                                        <span className="text-gray-900 truncate">{profile?.university || '未設定'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-gray-500 flex-shrink-0 w-20">卒業年:</span>
                                        <span className="text-gray-900 truncate">
                                            {profile?.graduationYear ? `${profile.graduationYear}年` : '未設定'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <Briefcase size={16} />
                                    経歴
                                </h3>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-gray-500 flex-shrink-0 w-20">実務経験:</span>
                                        <span className="text-gray-900 truncate">
                                            {profile?.workExperienceYears || profile?.workExperienceMonths
                                                ? `${profile.workExperienceYears || 0}年${profile.workExperienceMonths || 0}ヶ月`
                                                : '未設定'}
                                        </span>
                                    </div>
                                    {profile?.workExperienceTypes && profile.workExperienceTypes.length > 0 && (
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-gray-500 flex-shrink-0 w-20">経験業態:</span>
                                            <span className="text-gray-900 truncate">
                                                {profile.workExperienceTypes.join(', ')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 資格証明書 */}
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText size={16} />
                                資格証明書
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* 薬剤師免許証 */}
                                {(() => {
                                    const licenseCert = certificates.find((c) => c.certificateType === 'license');
                                    let statusText = '要提出';
                                    let statusColor = 'text-gray-600';
                                    let icon = null;

                                    if (licenseCert) {
                                        if (licenseCert.verificationStatus === 'verified') {
                                            statusText = '確認済';
                                            statusColor = 'text-green-600';
                                            icon = <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />;
                                        } else if (licenseCert.verificationStatus === 'pending') {
                                            statusText = '提出済';
                                            statusColor = 'text-yellow-600';
                                            icon = <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
                                        } else if (licenseCert.verificationStatus === 'rejected') {
                                            statusText = '要提出';
                                            statusColor = 'text-red-600';
                                            icon = <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
                                        }
                                    }

                                    return (
                                        <div className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1 min-w-0">
                                                {icon}
                                                <span className="text-xs font-medium whitespace-nowrap">薬剤師免許証</span>
                                            </div>
                                            <p className={`text-xs font-medium ${statusColor}`}>
                                                {statusText}
                                            </p>
                                        </div>
                                    );
                                })()}

                                {/* 保険薬剤師登録票 */}
                                {(() => {
                                    const registrationCert = certificates.find((c) => c.certificateType === 'registration');
                                    let statusText = '要提出';
                                    let statusColor = 'text-gray-600';
                                    let icon = null;

                                    if (registrationCert) {
                                        if (registrationCert.verificationStatus === 'verified') {
                                            statusText = '確認済';
                                            statusColor = 'text-green-600';
                                            icon = <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />;
                                        } else if (registrationCert.verificationStatus === 'pending') {
                                            statusText = '提出済';
                                            statusColor = 'text-yellow-600';
                                            icon = <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
                                        } else if (registrationCert.verificationStatus === 'rejected') {
                                            statusText = '要提出';
                                            statusColor = 'text-red-600';
                                            icon = <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
                                        }
                                    }

                                    return (
                                        <div className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1 min-w-0">
                                                {icon}
                                                <span className="text-xs font-medium">保険薬剤師登録票</span>
                                            </div>
                                            <p className={`text-xs font-medium ${statusColor}`}>
                                                {statusText}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* スキル・専門分野 */}
                        {(profile?.specialtyAreas && profile.specialtyAreas.length > 0) ||
                        (profile?.pharmacySystems && profile.pharmacySystems.length > 0) ||
                        profile?.specialNotes ? (
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Award size={16} />
                                    スキル・専門分野
                                </h3>
                                <div className="grid grid-cols-2 gap-8">
                                    {profile?.specialtyAreas && profile.specialtyAreas.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-medium text-gray-700 mb-2">得意な診療科・疾患領域</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {profile.specialtyAreas.map((area, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs"
                                                    >
                                                        {area}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {profile?.pharmacySystems && profile.pharmacySystems.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-medium text-gray-700 mb-2">使用経験のある薬歴システム</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {profile.pharmacySystems.map((system, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs"
                                                    >
                                                        {system}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {profile?.specialNotes && (
                                        <div className="col-span-2">
                                            <h4 className="text-xs font-medium text-gray-700 mb-2">特記事項</h4>
                                            <p className="text-xs text-gray-700 whitespace-pre-wrap">{profile.specialNotes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}

                        {/* 自己紹介 */}
                        {profile?.selfIntroduction && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText size={16} />
                                    自己紹介・アピールポイント
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                                    {profile.selfIntroduction}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </PharmacistLayout>
        </ProtectedRoute>
    );
}
