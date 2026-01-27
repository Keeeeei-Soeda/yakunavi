'use client';

import React from 'react';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { Clock, DollarSign, Users } from 'lucide-react';

// モックデータ
const mockPayrollData = {
    totalHours: 280,
    totalPayment: 664000,
    employeeCount: 2,
    employees: [
        {
            id: 1,
            name: '佐藤 太郎',
            position: '正社員',
            hours: 160,
            hourlyRate: 2500,
            monthlyTotal: 400000,
        },
        {
            id: 2,
            name: '鈴木 花音',
            position: 'パート',
            hours: 120,
            hourlyRate: 2200,
            monthlyTotal: 264000,
        },
    ],
};

export default function PayrollPage() {
    return (
        <PharmacyLayout title="1ヶ月の勤務時間と費用">
            {/* サマリーカード */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-600">総勤務時間</h3>
                        <Clock className="text-blue-600" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-blue-600">
                        {mockPayrollData.totalHours}時間
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-600">給与作業費</h3>
                        <DollarSign className="text-green-600" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                        ¥{mockPayrollData.totalPayment.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-600">雇用中薬剤師</h3>
                        <Users className="text-orange-600" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-orange-600">
                        {mockPayrollData.employeeCount}名
                    </p>
                </div>
            </div>

            {/* 薬剤師別費用詳細 */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">薬剤師別費用詳細</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    薬剤師名
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    雇用形態
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    勤務時間
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    時給
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    月額給与
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mockPayrollData.employees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {employee.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {employee.position}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {employee.hours}時間
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ¥{employee.hourlyRate.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        ¥{employee.monthlyTotal.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PharmacyLayout>
    );
}

