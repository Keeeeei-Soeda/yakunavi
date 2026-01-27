'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreateJobPostingInput } from '@/lib/api/jobPostings';
import { PREFECTURES } from '@/lib/constants/prefectures';

interface JobPostingFormProps {
  initialData?: Partial<CreateJobPostingInput>;
  pharmacyId: number;
  onSubmit: (data: CreateJobPostingInput, status: 'draft' | 'published') => Promise<void>;
  submitLabel?: string;
}

export const JobPostingForm: React.FC<JobPostingFormProps> = ({
  initialData,
  pharmacyId,
  onSubmit,
  submitLabel = '登録',
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 勤務開始可能期間のデフォルト値（今日から2週間後）
  const getDefaultWorkStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  };

  // 募集期限のデフォルト値（今日から7日後）
  const getDefaultRecruitmentDeadline = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<CreateJobPostingInput>({
    pharmacyId,
    title: initialData?.title || '',
    description: initialData?.description || '',
    workLocation: initialData?.workLocation || '',
    dailyWage: initialData?.dailyWage || 0,
    desiredWorkDays: initialData?.desiredWorkDays || 0,
    workStartPeriodFrom: initialData?.workStartPeriodFrom || getDefaultWorkStartDate(),
    workStartPeriodTo: initialData?.workStartPeriodTo || '',
    recruitmentDeadline: initialData?.recruitmentDeadline || getDefaultRecruitmentDeadline(),
    requirements: initialData?.requirements || '',
    desiredWorkHours: initialData?.desiredWorkHours || '',
  });

  const [prefecture, setPrefecture] = useState('');
  const [city, setCity] = useState('');
  const [totalCompensation, setTotalCompensation] = useState(0);
  const [platformFee, setPlatformFee] = useState(0);

  // workLocationを都道府県と市区町村に分解
  useEffect(() => {
    if (initialData?.workLocation) {
      const match = initialData.workLocation.match(/^(.+?[都道府県])(.+)$/);
      if (match) {
        setPrefecture(match[1]);
        setCity(match[2]);
      }
    }
  }, [initialData?.workLocation]);

  // 報酬総額とプラットフォーム手数料を自動計算
  useEffect(() => {
    const total = formData.dailyWage * (formData.desiredWorkDays || 0);
    const fee = Math.floor(total * 0.4);
    setTotalCompensation(total);
    setPlatformFee(fee);
  }, [formData.dailyWage, formData.desiredWorkDays]);

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault();

    // バリデーション（公開する場合は必須項目をチェック）
    if (formData.dailyWage < 20000) {
      alert('日給は20,000円以上で設定してください');
      return;
    }

    if (!formData.desiredWorkDays || formData.desiredWorkDays < 15 || formData.desiredWorkDays > 90) {
      alert('希望勤務日数は15日以上90日以下で設定してください');
      return;
    }

    if (!prefecture || !city) {
      alert('勤務地を入力してください');
      return;
    }

    if (!formData.workStartPeriodFrom) {
      alert('勤務開始可能期間（開始日）を入力してください');
      return;
    }

    if (!formData.recruitmentDeadline) {
      alert('募集期限を入力してください');
      return;
    }

    // 公開する場合は、必須項目を追加でチェック
    if (status === 'published') {
      if (!formData.title || formData.title.trim() === '') {
        alert('求人タイトルを入力してください');
        return;
      }
      if (!formData.requirements || formData.requirements.trim() === '') {
        alert('応募条件・資格を入力してください');
        return;
      }
    }

    setLoading(true);

    try {
      // workStartPeriodToが空の場合は、workStartPeriodFromの14日後をデフォルトに設定
      let workStartPeriodTo = formData.workStartPeriodTo;
      if (!workStartPeriodTo) {
        const startDate = new Date(formData.workStartPeriodFrom);
        startDate.setDate(startDate.getDate() + 14);
        workStartPeriodTo = startDate.toISOString().split('T')[0];
      }

      // workLocationを都道府県+市区町村で結合
      const submitData = {
        ...formData,
        workLocation: `${prefecture}${city}`,
        workStartPeriodTo,
        desiredWorkDays: formData.desiredWorkDays || 30,
        totalCompensation,
        platformFee,
      };
      await onSubmit(submitData, status);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* 基本情報 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">基本情報</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              求人タイトル *
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：急募！大阪市中央区の調剤薬局で薬剤師募集"
            />
            <p className="text-xs text-gray-500 mt-1">最大100文字</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              求人詳細
            </label>
            <textarea
              maxLength={2000}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：&#10;- 主な業務内容&#10;- 職場の雰囲気&#10;- 設備・システム&#10;- その他アピールポイント"
            />
            <p className="text-xs text-gray-500 mt-1">最大2000文字（{formData.description?.length || 0}/2000）</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                都道府県 *
              </label>
              <select
                required
                value={prefecture}
                onChange={(e) => setPrefecture(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {PREFECTURES.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                市区町村 *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例：中央区"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 勤務条件 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">勤務条件</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                日給 *
              </label>
              <input
                type="number"
                required
                min={20000}
                value={formData.dailyWage === 0 ? '' : formData.dailyWage}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : Number(e.target.value);
                  setFormData({ ...formData, dailyWage: value });
                }}
                onFocus={(e) => {
                  // フォーカス時に値を選択状態にする
                  e.target.select();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 25000"
              />
              <p className="text-xs text-gray-500 mt-1">日給は20,000円以上で設定してください</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                希望勤務日数 *
              </label>
              <input
                type="number"
                required
                min={15}
                max={90}
                value={formData.desiredWorkDays === 0 || !formData.desiredWorkDays ? '' : formData.desiredWorkDays}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : Number(e.target.value);
                  setFormData({ ...formData, desiredWorkDays: value });
                }}
                onFocus={(e) => {
                  // フォーカス時に値を選択状態にする
                  e.target.select();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 30"
              />
              <p className="text-xs text-gray-500 mt-1">15日以上90日以下</p>
            </div>
          </div>

          {/* 報酬総額の表示 */}
          {formData.dailyWage > 0 && formData.desiredWorkDays && formData.desiredWorkDays > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">
                報酬総額：{totalCompensation.toLocaleString()}円
                （日給{formData.dailyWage.toLocaleString()}円 × {formData.desiredWorkDays}日）
              </p>
              <p className="text-xs text-blue-700 mt-1">
                ※薬局から薬剤師への支払いは体験期間終了後
              </p>
              <p className="text-xs text-blue-700">
                プラットフォーム手数料（40%）：{platformFee.toLocaleString()}円
              </p>
            </div>
          )}

          {(formData.desiredWorkDays && formData.desiredWorkDays >= 60) ||
            (formData.desiredWorkDays && formData.desiredWorkDays <= 30 && formData.dailyWage >= 30000) ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-700">
                💡 長期間（60〜90日）または短期間で高単価の求人は応募が集まりやすい傾向があります
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                勤務開始可能期間（開始日） *
              </label>
              <input
                type="date"
                required
                min={getDefaultWorkStartDate()}
                value={formData.workStartPeriodFrom}
                onChange={(e) =>
                  setFormData({ ...formData, workStartPeriodFrom: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">今日から2週間後以降の日付を選択</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                勤務開始可能期間（終了日）
              </label>
              <input
                type="date"
                min={formData.workStartPeriodFrom}
                value={formData.workStartPeriodTo || ''}
                onChange={(e) =>
                  setFormData({ ...formData, workStartPeriodTo: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">開始日から2週間の範囲を推奨</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
            ※薬剤師と相談の上、初回勤務日を決定します
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              募集期限 *
            </label>
            <input
              type="date"
              required
              value={formData.recruitmentDeadline}
              onChange={(e) =>
                setFormData({ ...formData, recruitmentDeadline: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              最短3日後、最長14日後（デフォルト：7日後）
            </p>
          </div>
        </div>
      </div>

      {/* 詳細情報 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">詳細情報</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              応募条件・資格 *
            </label>
            <textarea
              required
              maxLength={500}
              value={formData.requirements}
              onChange={(e) =>
                setFormData({ ...formData, requirements: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：薬剤師免許必須、調剤経験3年以上"
            />
            <p className="text-xs text-gray-500 mt-1">最大500文字（{formData.requirements?.length || 0}/500）</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              希望勤務時間帯
            </label>
            <textarea
              value={formData.desiredWorkHours || ''}
              onChange={(e) =>
                setFormData({ ...formData, desiredWorkHours: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：平日9:00-18:00希望"
            />
            <p className="text-xs text-gray-500 mt-1">
              ※あくまで希望です。実際の勤務時間は薬剤師と相談の上決定します
            </p>
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, 'published')}
          disabled={loading}
          className="flex-[2] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-semibold"
        >
          {loading ? '処理中...' : '公開する'}
        </button>
      </div>
    </form>
  );
};

