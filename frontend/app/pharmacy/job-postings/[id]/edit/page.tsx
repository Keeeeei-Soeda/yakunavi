'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { JobPostingForm } from '@/components/pharmacy/JobPostingForm';
import { useAuthStore } from '@/lib/store/authStore';
import { jobPostingsAPI, JobPosting } from '@/lib/api/jobPostings';

export default function EditJobPostingPage() {
    const params = useParams();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const pharmacyId = user?.relatedId || 1;
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

    const handleSubmit = async (data: any, status: 'draft' | 'published') => {
        try {
            // 更新時は常に公開状態にする（新規作成と同じ動作）
            const updateData = {
                ...data,
                status: 'published',
            };

            const response = await jobPostingsAPI.update(id, updateData);
            if (response.success) {
                // 公開状態にする場合は、公開APIも呼び出す（既に公開中の場合は何もしない）
                if (jobPosting?.status !== 'published') {
                    await jobPostingsAPI.publish(id);
                    alert('求人を更新して公開しました');
                } else {
                    alert('求人を更新しました');
                }
                router.push('/pharmacy/job-postings');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            alert(error.response?.data?.error || '求人の更新に失敗しました');
        }
    };

    if (loading) {
        return (
            <ProtectedRoute requiredUserType="pharmacy">
                <PharmacyLayout title="求人編集">
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
                <PharmacyLayout title="求人編集">
                    <div className="flex items-center justify-center py-12">
                        <p className="text-gray-500">求人が見つかりませんでした</p>
                    </div>
                </PharmacyLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredUserType="pharmacy">
            <PharmacyLayout title="求人編集">
                <JobPostingForm
                    pharmacyId={pharmacyId}
                    initialData={{
                        title: jobPosting.title,
                        description: jobPosting.description,
                        workLocation: jobPosting.workLocation,
                        dailyWage: jobPosting.dailyWage,
                        desiredWorkDays: jobPosting.desiredWorkDays,
                        workStartPeriodFrom: jobPosting.workStartPeriodFrom,
                        workStartPeriodTo: jobPosting.workStartPeriodTo,
                        recruitmentDeadline: jobPosting.recruitmentDeadline,
                        requirements: jobPosting.requirements,
                        desiredWorkHours: jobPosting.desiredWorkHours,
                        totalCompensation: jobPosting.totalCompensation,
                        platformFee: jobPosting.platformFee,
                    }}
                    onSubmit={handleSubmit}
                    submitLabel="更新"
                />
            </PharmacyLayout>
        </ProtectedRoute>
    );
}

