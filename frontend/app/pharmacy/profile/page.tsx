'use client';

import React, { useState } from 'react';
import { PharmacyLayout } from '@/components/pharmacy/Layout';

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <PharmacyLayout
            title={isEditing ? 'プロフィール管理' : 'プロフィールプレビュー'}
            rightAction={
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                            >
                                キャンセル
                            </button>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                📋 保存
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                                👁 プレビュー
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                            >
                                編集に戻る
                            </button>
                        </>
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
                            <h3 className="text-lg font-semibold mb-4">基本情報</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        薬局名 *
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="羽曳野薬局"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        住所 *
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="大阪府"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        電話番号
                                    </label>
                                    <input
                                        type="tel"
                                        defaultValue="090-9101-0101"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        FAX
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        営業開始時間
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        営業終了時間
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 追加情報 */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">追加情報</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        最寄り駅
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        設立日
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        1日の処方箋枚数
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        スタッフ数
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 薬局の特徴 */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">薬局の特徴</h3>
                            <textarea
                                rows={4}
                                placeholder="薬局の紹介文"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                /* プレビューモード */
                <div className="bg-white rounded-lg shadow p-8">
                    <div className="flex items-start gap-6 mb-8">
                        <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-3xl">🏥</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">羽曳野薬局</h2>
                            <p className="text-gray-600">大阪府</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">基本情報</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex">
                                    <span className="text-gray-500 w-32">営業時間:</span>
                                    <span className="text-gray-900">未設定</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-32">定休日:</span>
                                    <span className="text-gray-900">未設定</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-32">設立:</span>
                                    <span className="text-gray-900">未設定</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-32">処方箋枚数:</span>
                                    <span className="text-gray-900">未設定</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">基本情報（続き）</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex">
                                    <span className="text-gray-500 w-32">電話番号:</span>
                                    <span className="text-gray-900">090-9101-0101</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-32">FAX:</span>
                                    <span className="text-gray-900">未設定</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-32">最寄り駅:</span>
                                    <span className="text-gray-900">未設定</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 w-32">スタッフ数:</span>
                                    <span className="text-gray-900">未設定</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-semibold text-gray-900 mb-3">薬局の特徴</h3>
                        <p className="text-gray-500">特徴は登録されていません</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">強み・特色</h3>
                            <p className="text-gray-500">登録されていません</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">設備・システム</h3>
                            <p className="text-gray-500">登録されていません</p>
                        </div>
                    </div>
                </div>
            )}
        </PharmacyLayout>
    );
}

