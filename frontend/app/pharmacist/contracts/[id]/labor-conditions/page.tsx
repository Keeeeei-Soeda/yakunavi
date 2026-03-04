'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacistLayout } from '@/components/pharmacist/Layout';
import { contractsAPI } from '@/lib/api/contracts';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Printer } from 'lucide-react';
import Link from 'next/link';

// 記入欄コンポーネント（印刷時も枠線が表示される）
function FillField({
  value,
  onChange,
  placeholder = '（記入欄）',
  multiline = false,
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  hint?: string;
}) {
  const baseClass = 'w-full min-h-[1.5rem] px-1 py-0.5 border-b border-gray-400 bg-transparent focus:outline-none focus:ring-1 focus:ring-teal-500 rounded-sm print:border-gray-600';
  return (
    <div className="relative">
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${baseClass} min-h-[3rem] resize-y`}
          rows={3}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
      {hint && (
        <p className="text-xs text-gray-500 mt-1 print:hidden">{hint}</p>
      )}
    </div>
  );
}

const DEFAULT_FIELDS = {
  contractPeriod: '',
  workLocation: '',
  jobContent: '',
  workHours: '',
  wageMethod: '',
  resignation: '',
  salaryIncrease: '',
  workPlaceChange: '',
  renewalLimit: '',
  indefiniteConversion: '',
};

export default function LaborConditionsNoticePage() {
  const params = useParams();
  const contractId = Number(params.id);

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 記入欄の状態（localStorageで保存、労働開始後に薬局・薬剤師で一緒に埋める）
  const storageKey = `labor-conditions-${contractId}`;
  const [fields, setFields] = useState(DEFAULT_FIELDS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFields({ ...DEFAULT_FIELDS, ...parsed });
      }
    } catch {
      // 無視
    }
  }, [contractId]);

  useEffect(() => {
    if (Object.values(fields).some((v) => v !== '')) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(fields));
      } catch {
        // 無視
      }
    }
  }, [fields, storageKey]);

  useEffect(() => {
    fetchContractDetail();
  }, [contractId]);

  const fetchContractDetail = async () => {
    setLoading(true);
    try {
      const response = await contractsAPI.getById(contractId);
      if (response.success && response.data) {
        setContract(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch contract detail:', error);
    } finally {
      setLoading(false);
    }
  };

  // 印刷機能
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <ProtectedRoute requiredUserType="pharmacist">
        <PharmacistLayout hideSidebar={true}>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        </PharmacistLayout>
      </ProtectedRoute>
    );
  }

  if (!contract) {
    return (
      <ProtectedRoute requiredUserType="pharmacist">
        <PharmacistLayout hideSidebar={true}>
          <div className="text-center py-12">
            <p className="text-gray-500">契約が見つかりません</p>
            <Link href="/pharmacist/contracts" className="text-blue-600 hover:underline mt-4 inline-block">
              契約一覧に戻る
            </Link>
          </div>
        </PharmacistLayout>
      </ProtectedRoute>
    );
  }

  const pharmacist = contract.pharmacist;
  const pharmacy = contract.pharmacy;
  const jobPosting = contract.jobPosting;

  // 日付の計算（参考表示用）
  const contractStartDate = new Date(contract.initialWorkDate);
  const contractEndDate = new Date(contractStartDate);
  contractEndDate.setDate(contractEndDate.getDate() + contract.workDays - 1);
  const contractPeriodHint = `${format(contractStartDate, 'yyyy年MM月dd日', { locale: ja })} 〜 ${format(contractEndDate, 'yyyy年MM月dd日', { locale: ja })} (契約より)`;
  const wageHint = `日給 ¥${contract.dailyWage.toLocaleString()}、勤務日数 ${contract.workDays}日間、報酬総額 ¥${contract.totalCompensation.toLocaleString()} (契約より)`;

  const updateField = (key: keyof typeof fields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  // 現在の日付（令和年号）
  const getReiwaYear = (date: Date) => {
    const reiwaStart = new Date(2019, 4, 1); // 令和元年5月1日
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if (date >= reiwaStart) {
      const reiwaYear = year - 2018;
      return `令和${reiwaYear}年${month}月${day}日`;
    }
    return format(date, 'yyyy年MM月dd日', { locale: ja });
  };

  return (
    <ProtectedRoute requiredUserType="pharmacist">
      <PharmacistLayout hideSidebar={true}>
        <div className="space-y-6 labor-conditions-container">
          {/* ヘッダー */}
          <div className="flex items-center justify-between no-print">
            <div>
              <Link
                href={`/pharmacist/contracts/${contractId}`}
                className="text-blue-600 hover:underline text-sm mb-2 inline-block"
              >
                ← 契約詳細に戻る
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">労働条件通知書（雛形）</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Printer className="w-4 h-4" />
                <span>印刷 / PDF保存</span>
              </button>
            </div>
          </div>

          {/* 印刷用ヘッダー（印刷時のみ表示） */}
          <div className="hidden print-only mb-6">
            <div className="text-right text-sm text-gray-600 mb-4">
              発行日: {format(new Date(), 'yyyy年MM月dd日', { locale: ja })}
            </div>
          </div>

          {/* 労働条件通知書の内容（雛形） */}
          <div className="bg-white rounded-lg shadow p-8 labor-conditions-content">
            {/* タイトル */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">労働条件通知書（雛形）</h1>
              <p className="text-sm text-gray-600">(労働基準法第15条に基づく)</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 print:border print:rounded">
              <p className="text-sm text-blue-900">
                本雛形は労働条件通知書のテンプレートです。空欄部分を薬局と薬剤師の両者で確認・記入の上、<strong>最終的に書類を作成し、取り交わしてください。</strong>
              </p>
            </div>

            {/* 労働条件の表 */}
            <div className="mb-8">
              <table className="w-full border-collapse border border-gray-400">
                <tbody>
                  {/* 氏名 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold w-1/3">
                      氏名
                    </td>
                    <td className="p-3">
                      {pharmacist?.lastName} {pharmacist?.firstName} 様
                    </td>
                  </tr>

                  {/* 雇用主 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      雇用主
                    </td>
                    <td className="p-3">
                      {pharmacy?.pharmacyName || pharmacy?.companyName || pharmacy?.name || '薬局名'}
                      {pharmacy?.representativeLastName && pharmacy?.representativeFirstName && (
                        <span className="ml-2">
                          (代表取締役: {pharmacy.representativeLastName} {pharmacy.representativeFirstName})
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* 1. 労働契約の期間 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      1. 労働契約の期間
                    </td>
                    <td className="p-3">
                      <FillField
                        value={fields.contractPeriod}
                        onChange={(v) => updateField('contractPeriod', v)}
                        placeholder="いつからいつまで働くか、または期間の定めなしか"
                        multiline
                        hint={contractPeriodHint}
                      />
                    </td>
                  </tr>

                  {/* 2. 就業の場所 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      2. 就業の場所
                    </td>
                    <td className="p-3">
                      <FillField
                        value={fields.workLocation}
                        onChange={(v) => updateField('workLocation', v)}
                        hint={jobPosting?.workLocation || pharmacy?.address ? `${jobPosting?.workLocation || pharmacy?.address}（契約より）` : undefined}
                      />
                    </td>
                  </tr>

                  {/* 3. 従事すべき業務の内容 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      3. 従事すべき業務の内容
                    </td>
                    <td className="p-3">
                      <FillField
                        value={fields.jobContent}
                        onChange={(v) => updateField('jobContent', v)}
                        placeholder="業務内容を記入"
                        multiline
                      />
                    </td>
                  </tr>

                  {/* 4. 始業・終業の時刻、休憩時間、休日、休暇、交代制勤務のローテーションなど */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      4. 始業・終業の時刻、休憩時間、休日、休暇、交代制勤務のローテーションなど
                    </td>
                    <td className="p-3">
                      <FillField
                        value={fields.workHours}
                        onChange={(v) => updateField('workHours', v)}
                        placeholder="始業・終業時刻、休憩、休日、休暇、交代制のローテーションなどを記入"
                        multiline
                        hint={contract.workHours ? `${contract.workHours}（契約より）` : undefined}
                      />
                    </td>
                  </tr>

                  {/* 5. 賃金の決定・計算・支払いの方法（賃金の締め日と支払日も含む） */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      5. 賃金の決定・計算・支払いの方法
                    </td>
                    <td className="p-3">
                      <FillField
                        value={fields.wageMethod}
                        onChange={(v) => updateField('wageMethod', v)}
                        placeholder="賃金の決定方法、計算方法、支払日、支払方法、締め日などを記入"
                        multiline
                        hint={wageHint}
                      />
                    </td>
                  </tr>

                  {/* 6. 退職に関する事項 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      6. 退職に関する事項
                    </td>
                    <td className="p-3">
                      <FillField
                        value={fields.resignation}
                        onChange={(v) => updateField('resignation', v)}
                        placeholder="解雇の事由、定年制、自己都合退職の手続きなどを記入"
                        multiline
                      />
                    </td>
                  </tr>

                  {/* 7. 昇給に関する事項 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      7. 昇給に関する事項
                    </td>
                    <td className="p-3">
                      <FillField
                        value={fields.salaryIncrease}
                        onChange={(v) => updateField('salaryIncrease', v)}
                        placeholder="昇給の有無、時期、方法などを記入（※書面交付は不要だが通常記載）"
                        multiline
                      />
                    </td>
                  </tr>

                  {/* 8. 就業場所・業務の変更の範囲 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      8. 就業場所・業務の変更の範囲
                    </td>
                    <td className="p-3">
                      <FillField
                        value={fields.workPlaceChange}
                        onChange={(v) => updateField('workPlaceChange', v)}
                        placeholder="転勤・部署異動がある場合の最大範囲を記入"
                        multiline
                      />
                    </td>
                  </tr>

                  {/* 9. 更新上限の有無と内容 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      9. 更新上限の有無と内容
                    </td>
                    <td className="p-3">
                      <FillField
                        value={fields.renewalLimit}
                        onChange={(v) => updateField('renewalLimit', v)}
                        placeholder="有期雇用の場合、契約更新の回数制限や通算期間の上限の有無・内容を記入"
                        multiline
                      />
                    </td>
                  </tr>

                  {/* 10. 無期転換申込機会の提示 */}
                  <tr>
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      10. 無期転換申込機会の提示
                    </td>
                    <td className="p-3">
                      <FillField
                        value={fields.indefiniteConversion}
                        onChange={(v) => updateField('indefiniteConversion', v)}
                        placeholder="5年超の有期雇用労働者への無期転換申込の可否などを記入"
                        multiline
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 備考 */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">備考</h3>
              <p className="text-sm text-gray-700">
                その他、就業規則に定める内容に準ずるものとする。
              </p>
            </div>

            {/* 雛形の取り交わし案内 */}
            <div className="border-t-2 border-gray-300 pt-6">
              <p className="text-sm font-medium text-gray-800">
                ※ 本雛形をご活用の上、薬局と薬剤師の両者で内容を確認・記入し、最終的に書類を作成の上、取り交わしてください。
              </p>
            </div>

            {/* 会社情報 */}
            <div className="border-t-2 border-gray-400 pt-6">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">会社名</p>
                  <p className="font-medium">
                    {pharmacy?.pharmacyName || pharmacy?.companyName || pharmacy?.name || '薬局名'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">所在地</p>
                  <p className="font-medium">
                    {pharmacy?.prefecture && pharmacy?.address
                      ? `${pharmacy.prefecture}${pharmacy.address}`
                      : pharmacy?.prefecture || pharmacy?.address || '未設定'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">電話番号</p>
                  <p className="font-medium">
                    {pharmacy?.phoneNumber || '未設定'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">代表者名</p>
                  <p className="font-medium">
                    {pharmacy?.representativeLastName && pharmacy?.representativeFirstName
                      ? `${pharmacy.representativeLastName} ${pharmacy.representativeFirstName}`
                      : '未設定'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 mb-1">日付</p>
                  <p className="font-medium">{getReiwaYear(new Date())}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PharmacistLayout>
    </ProtectedRoute>
  );
}

