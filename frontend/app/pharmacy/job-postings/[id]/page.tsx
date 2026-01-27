'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { jobPostingsAPI, JobPosting } from '@/lib/api/jobPostings';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';

export default function JobPostingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const [jobPosting, setJobPosting] = useState<JobPosting | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobPosting();
    }, [id]);

    const fetchJobPosting = async () => {
        setLoading(true);
        try {
            const response = await jobPostingsAPI.getById(id);
            if (response.success && response.data) {
                setJobPosting(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch job posting:', error);
            alert('求人の取得に失敗しました');
            router.push('/pharmacy/job-postings');
        } finally {
            setLoading(false);
        }
    };

    // workLocationを都道府県と市区町村に分解
    const parseWorkLocation = (location: string) => {
        const match = location.match(/^(.+?[都道府県])(.+)$/);
        if (match) {
            return { prefecture: match[1], city: match[2] };
        }
        return { prefecture: location, city: '' };
    };

    if (loading) {
        return (
            <ProtectedRoute requiredUserType="pharmacy">
                <PharmacyLayout title="求人詳細">
                    <div className="flex items-center justify-center py-12">
                        <p className="text-gray-500">読み込み中...</p>
                    </div>
                </PharmacyLayout>
            </ProtectedRoute>
        );
    }

    if (!jobPosting) {
        return (
            <ProtectedRoute requiredUserType="pharmacy">
                <PharmacyLayout title="求人詳細">
                    <div className="flex items-center justify-center py-12">
                        <p className="text-gray-500">求人が見つかりませんでした</p>
                    </div>
                </PharmacyLayout>
            </ProtectedRoute>
        );
    }

    const { prefecture, city } = parseWorkLocation(jobPosting.workLocation);

    return (
        <ProtectedRoute requiredUserType="pharmacy">
            <PharmacyLayout title="求人詳細">
                <div className="space-y-6">
                    {/* 戻るボタン */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        一覧に戻る
                    </button>

                    {/* 基本情報 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-semibold text-gray-900">{jobPosting.title}</h2>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${jobPosting.status === 'published'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {jobPosting.status === 'published' ? '公開中' : '下書き'}
                            </span>
                        </div>

                        {jobPosting.description && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">求人詳細</h3>
                                <p className="text-gray-600 whitespace-pre-wrap">{jobPosting.description}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">勤務地</h3>
                                <p className="text-gray-900">
                                    {prefecture} {city}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">日給</h3>
                                <p className="text-gray-900">¥{jobPosting.dailyWage.toLocaleString()}</p>
                            </div>

                            {jobPosting.desiredWorkDays && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">希望勤務日数</h3>
                                    <p className="text-gray-900">{jobPosting.desiredWorkDays}日</p>
                                </div>
                            )}

                            {jobPosting.workStartPeriodFrom && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">勤務開始可能期間</h3>
                                    <p className="text-gray-900">
                                        {format(new Date(jobPosting.workStartPeriodFrom), 'yyyy年MM月dd日', { locale: ja })}
                                        {jobPosting.workStartPeriodTo && (
                                            <> 〜 {format(new Date(jobPosting.workStartPeriodTo), 'yyyy年MM月dd日', { locale: ja })}</>
                                        )}
                                    </p>
                                </div>
                            )}

                            {jobPosting.recruitmentDeadline && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">募集期限</h3>
                                    <p className="text-gray-900">
                                        {format(new Date(jobPosting.recruitmentDeadline), 'yyyy年MM月dd日', { locale: ja })}
                                    </p>
                                </div>
                            )}

                            {jobPosting.totalCompensation && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">報酬総額</h3>
                                    <p className="text-gray-900">¥{jobPosting.totalCompensation.toLocaleString()}</p>
                                </div>
                            )}

                            {jobPosting.platformFee && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">プラットフォーム手数料</h3>
                                    <p className="text-gray-900">¥{jobPosting.platformFee.toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 応募条件・資格 */}
                    {jobPosting.requirements && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">応募条件・資格</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{jobPosting.requirements}</p>
                        </div>
                    )}

                    {/* 希望勤務時間帯 */}
                    {jobPosting.desiredWorkHours && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">希望勤務時間帯</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{jobPosting.desiredWorkHours}</p>
                        </div>
                    )}

                    {/* 統計情報 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">統計情報</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">閲覧数</h4>
                                <p className="text-2xl font-semibold text-gray-900">{jobPosting.viewCount || 0}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">応募数</h4>
                                <p className="text-2xl font-semibold text-gray-900">{jobPosting.applicationCount || 0}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">作成日</h4>
                                <p className="text-sm text-gray-900">
                                    {format(new Date(jobPosting.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </PharmacyLayout>
        </ProtectedRoute>
    );
}

