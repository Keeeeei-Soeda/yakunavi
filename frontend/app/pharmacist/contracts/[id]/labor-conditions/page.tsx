'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacistLayout } from '@/components/pharmacist/Layout';
import { contractsAPI } from '@/lib/api/contracts';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';

export default function LaborConditionsNoticePage() {
  const params = useParams();
  const router = useRouter();
  const contractId = Number(params.id);

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  // 日付の計算
  const contractStartDate = new Date(contract.initialWorkDate);
  const contractEndDate = new Date(contractStartDate);
  contractEndDate.setDate(contractEndDate.getDate() + contract.workDays - 1);

  // 勤務時間の解析
  const parseWorkHours = (workHours?: string) => {
    if (!workHours) return { startHour: '', startMin: '', endHour: '', endMin: '', break: '' };
    // "9:00-18:00" または "09:00-18:00" 形式を解析
    const match = workHours.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
    if (match) {
      const startHour = parseInt(match[1]);
      const startMin = match[2];
      const endHour = parseInt(match[3]);
      const endMin = match[4];
      return {
        startHour: startHour.toString(),
        startMin,
        endHour: endHour.toString(),
        endMin,
        break: '60', // デフォルト60分
      };
    }
    return { startHour: '', startMin: '', endHour: '', endMin: '', break: '' };
  };

  const workHours = parseWorkHours(contract.workHours);

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
              <h1 className="text-2xl font-bold text-gray-900">労働条件通知書</h1>
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

          {/* 労働条件通知書の内容 */}
          <div className="bg-white rounded-lg shadow p-8 labor-conditions-content">
            {/* タイトル */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">労働条件通知書</h1>
              <p className="text-sm text-gray-600">(労働基準法第15条に基づく)</p>
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
                      {pharmacy?.pharmacyName || pharmacy?.name || '薬局名'}
                      {pharmacy?.representativeLastName && pharmacy?.representativeFirstName && (
                        <span className="ml-2">
                          (代表取締役: {pharmacy.representativeLastName} {pharmacy.representativeFirstName})
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* 雇用形態 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      雇用形態
                    </td>
                    <td className="p-3">
                      契約社員（有期雇用）
                    </td>
                  </tr>

                  {/* 勤務場所 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      勤務場所
                    </td>
                    <td className="p-3">
                      {jobPosting?.workLocation || pharmacy?.address || pharmacy?.prefecture || '未設定'}
                    </td>
                  </tr>

                  {/* 業務内容 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      業務内容
                    </td>
                    <td className="p-3">
                      薬剤師業務（調剤、服薬指導、在宅医療サポート等）
                    </td>
                  </tr>

                  {/* 就業時間 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      就業時間
                    </td>
                    <td className="p-3">
                      {workHours.startHour && workHours.endHour ? (
                        <>
                          午前{workHours.startHour}時{workHours.startMin}分 ~ 午後{workHours.endHour}時{workHours.endMin}分
                          {workHours.break && ` (休憩${workHours.break}分)`}
                        </>
                      ) : contract.workHours ? (
                        contract.workHours
                      ) : (
                        '未設定'
                      )}
                    </td>
                  </tr>

                  {/* 残業の有無 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      残業の有無
                    </td>
                    <td className="p-3">
                      無（所定外労働）
                    </td>
                  </tr>

                  {/* 休日 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      休日
                    </td>
                    <td className="p-3">
                      契約期間中の勤務日以外
                    </td>
                  </tr>

                  {/* 休暇 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      休暇
                    </td>
                    <td className="p-3">
                      慶弔休暇など（薬局の就業規則に準ずる）
                    </td>
                  </tr>

                  {/* 賃金 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      賃金
                    </td>
                    <td className="p-3">
                      日給 {contract.dailyWage.toLocaleString()}円
                      <br />
                      <span className="text-sm text-gray-600">
                        ※支払日は勤務終了後、薬局から直接お支払いいただきます
                      </span>
                    </td>
                  </tr>

                  {/* 加入保険 */}
                  <tr className="border-b border-gray-400">
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      加入保険
                    </td>
                    <td className="p-3">
                      労災保険（該当するもの）
                    </td>
                  </tr>

                  {/* 契約期間 */}
                  <tr>
                    <td className="border-r border-gray-400 bg-gray-50 p-3 font-semibold">
                      契約期間
                    </td>
                    <td className="p-3">
                      {format(contractStartDate, 'yyyy年MM月dd日', { locale: ja })} ~{' '}
                      {format(contractEndDate, 'yyyy年MM月dd日', { locale: ja })} (有期)
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

            {/* 会社情報 */}
            <div className="border-t-2 border-gray-400 pt-6">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">会社名</p>
                  <p className="font-medium">
                    {pharmacy?.pharmacyName || pharmacy?.name || '薬局名'}
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

