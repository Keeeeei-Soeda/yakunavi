'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardStats } from '@/lib/api/admin';
import {
    Building2,
    Users,
    Briefcase,
    FileText,
    AlertCircle,
    CreditCard,
} from 'lucide-react';

interface DashboardStats {
    totalPharmacies: number;
    totalPharmacists: number;
    activeJobPostings: number;
    totalContracts: number;
    pendingCertificates: number;
    pendingPayments: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);

            // デバッグ: トークンの確認
            const token = localStorage.getItem('token');
            const userType = localStorage.getItem('userType');
            console.log('Token exists:', !!token);
            console.log('User type:', userType);
            console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'none');

            const response = await getDashboardStats();
            setStats(response.data);
        } catch (err: any) {
            console.error('Failed to fetch stats:', err);
            setError('統計データの取得に失敗しました');
            if (err.response?.status === 401 || err.response?.status === 403) {
                console.error('Authentication failed, redirecting to login');
                router.push('/admin/auth/login');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">読み込み中...</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <p className="text-red-600">{error || 'エラーが発生しました'}</p>
                    <button
                        onClick={fetchStats}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        再読み込み
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto w-full">
            {/* ページタイトル */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
                <p className="mt-2 text-sm text-gray-600">システム全体の統計情報とサマリー</p>
            </div>
            {/* サマリーカード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <button
                    onClick={() => router.push('/admin/pharmacies')}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">登録薬局数</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalPharmacies}件</p>
                            <p className="text-xs text-gray-500 mt-1">クリックして確認</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => router.push('/admin/pharmacists')}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <Users className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">登録薬剤師数</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalPharmacists}件</p>
                            <p className="text-xs text-gray-500 mt-1">クリックして確認</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => router.push('/admin/job-postings')}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">アクティブ求人</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.activeJobPostings}件</p>
                            <p className="text-xs text-gray-500 mt-1">クリックして確認</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => router.push('/admin/contracts')}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">契約成立数</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalContracts}件</p>
                            <p className="text-xs text-gray-500 mt-1">クリックして確認</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => router.push('/admin/certificates')}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-red-100 text-red-600">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">未確認証明書</p>
                            <p className="text-2xl font-bold text-red-600">{stats.pendingCertificates}件</p>
                            <p className="text-xs text-gray-500 mt-1">クリックして確認</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => router.push('/admin/payments')}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">未確認支払い</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.pendingPayments}件</p>
                            <p className="text-xs text-gray-500 mt-1">クリックして確認</p>
                        </div>
                    </div>
                </button>
            </div>

        </div>
    );
}

