'use client';

import React from 'react';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { UserCircle } from 'lucide-react';

export default function PharmacistProfilesPage() {
  return (
    <PharmacyLayout title="採用薬剤師のプロフィール">
      {/* 空の状態 */}
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
  );
}

