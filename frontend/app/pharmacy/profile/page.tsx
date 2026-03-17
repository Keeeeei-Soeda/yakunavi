'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { useAuthStore } from '@/lib/store/authStore';
import { pharmacyAPI, PharmacyProfile, PharmacyBranch } from '@/lib/api/pharmacy';
import { Building2, Phone, MapPin, Clock, Users, FileText, Plus, Trash2 } from 'lucide-react';

// =========== 型 ===========
interface CompanyForm {
  companyName: string;
  representativeLastName: string;
  representativeFirstName: string;
}

type BranchForm = Partial<PharmacyBranch>;

// =========== ヘルパー ===========
function extractTime(s?: string): string {
  if (!s) return '';
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  if (/^\d{2}:\d{2}$/.test(s)) return s;
  return '';
}

function formatTime(s?: string): string {
  if (!s) return '未設定';
  return extractTime(s) || '未設定';
}

function formatDate(s?: string): string {
  if (!s) return '未設定';
  return new Date(s).toLocaleDateString('ja-JP');
}

// =========== ページ ===========
export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const pharmacyId = user?.relatedId || 1;

  const [profile, setProfile] = useState<PharmacyProfile | null>(null);
  const [branches, setBranches] = useState<PharmacyBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 選択中のタブインデックス（-1 = 法人情報タブ）
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const [companyForm, setCompanyForm] = useState<CompanyForm>({
    companyName: '',
    representativeLastName: '',
    representativeFirstName: '',
  });
  const [branchForm, setBranchForm] = useState<BranchForm>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, branchRes] = await Promise.all([
        pharmacyAPI.getProfile(pharmacyId),
        pharmacyAPI.getBranches(pharmacyId),
      ]);
      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
        setCompanyForm({
          companyName: profileRes.data.companyName,
          representativeLastName: profileRes.data.representativeLastName,
          representativeFirstName: profileRes.data.representativeFirstName,
        });
      }
      if (branchRes.success && branchRes.data) {
        setBranches(branchRes.data);
        if (branchRes.data.length > 0) {
          loadBranchForm(branchRes.data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch profile:', e);
    } finally {
      setLoading(false);
    }
  }, [pharmacyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // タブ切り替え時にフォームデータを更新
  useEffect(() => {
    if (branches[activeTab]) {
      loadBranchForm(branches[activeTab]);
    }
    setIsEditing(false);
  }, [activeTab, branches.length]);

  function loadBranchForm(branch: PharmacyBranch) {
    setBranchForm({
      ...branch,
      businessHoursStart: extractTime(branch.businessHoursStart),
      businessHoursEnd: extractTime(branch.businessHoursEnd),
    });
  }

  const handleSaveCompany = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await pharmacyAPI.updateProfile(pharmacyId, companyForm);
      if (res.success && res.data) {
        setProfile(res.data);
        setIsEditing(false);
        alert('法人情報を更新しました');
      }
    } catch (e: any) {
      alert(e.response?.data?.error || '更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBranch = async () => {
    const branch = branches[activeTab];
    if (!branch) return;
    setSaving(true);
    try {
      const res = await pharmacyAPI.updateBranch(pharmacyId, branch.id, branchForm);
      if (res.success && res.data) {
        const updated = [...branches];
        updated[activeTab] = res.data;
        setBranches(updated);
        setIsEditing(false);
        alert('薬局情報を更新しました');
      }
    } catch (e: any) {
      alert(e.response?.data?.error || '更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (branches[activeTab]) loadBranchForm(branches[activeTab]);
    setIsEditing(false);
  };

  const handleAddBranch = async () => {
    setSaving(true);
    try {
      const res = await pharmacyAPI.createBranch(pharmacyId, {
        name: `薬局${branches.length + 1}`,
      });
      if (res.success && res.data) {
        const newBranches = [...branches, res.data];
        setBranches(newBranches);
        setActiveTab(newBranches.length - 1);
        setIsEditing(true);
        loadBranchForm(res.data);
      }
    } catch (e: any) {
      alert(e.response?.data?.error || '薬局の追加に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBranch = async (index: number) => {
    const branch = branches[index];
    if (!branch) return;
    if (!confirm(`「${branch.name}」を削除しますか？\n公開中・下書き中の求人がある場合は削除できません。`)) return;
    try {
      await pharmacyAPI.deleteBranch(pharmacyId, branch.id);
      const updated = branches.filter((_, i) => i !== index);
      setBranches(updated);
      setActiveTab(Math.max(0, index - 1));
      alert('薬局を削除しました');
    } catch (e: any) {
      alert(e.response?.data?.error || '削除に失敗しました');
    }
  };

  // =========== ローディング ===========
  if (loading) {
    return (
      <ProtectedRoute requiredUserType="pharmacy">
        <PharmacyLayout title="プロフィール管理">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        </PharmacyLayout>
      </ProtectedRoute>
    );
  }

  const currentBranch = branches[activeTab] ?? null;

  // =========== 編集ボタンエリア ===========
  const editActions = (
    <div className="flex gap-2">
      {isEditing ? (
        <>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={currentBranch ? handleSaveBranch : handleSaveCompany}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          編集
        </button>
      )}
    </div>
  );

  return (
    <ProtectedRoute requiredUserType="pharmacy">
      <PharmacyLayout
        title={isEditing ? 'プロフィール編集' : 'プロフィール管理'}
        rightAction={editActions}
      >
        {/* ===== 法人情報（常に上部に表示）===== */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Building2 size={18} />
            法人情報
          </h2>
          {isEditing && !currentBranch ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">法人名 *</label>
                <input
                  type="text"
                  value={companyForm.companyName}
                  onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">代表者姓 *</label>
                <input
                  type="text"
                  value={companyForm.representativeLastName}
                  onChange={(e) => setCompanyForm({ ...companyForm, representativeLastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">代表者名 *</label>
                <input
                  type="text"
                  value={companyForm.representativeFirstName}
                  onChange={(e) => setCompanyForm({ ...companyForm, representativeFirstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="flex gap-8 text-sm">
              <div>
                <span className="text-gray-500">法人名: </span>
                <span className="font-medium">{profile?.companyName || '未設定'}</span>
              </div>
              <div>
                <span className="text-gray-500">代表者: </span>
                <span className="font-medium">
                  {profile?.representativeLastName} {profile?.representativeFirstName}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ===== 薬局タブ ===== */}
        <div className="bg-white rounded-lg shadow">
          {/* タブヘッダー */}
          <div className="flex items-center border-b border-gray-200 overflow-x-auto">
            {branches.map((branch, i) => (
              <button
                key={branch.id}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === i
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {branch.name}
              </button>
            ))}
            <button
              onClick={handleAddBranch}
              disabled={saving}
              className="ml-2 flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <Plus size={16} />
              薬局を追加
            </button>
          </div>

          {/* タブコンテンツ */}
          {currentBranch ? (
            <div className="p-6">
              {isEditing ? (
                <BranchEditForm
                  form={branchForm}
                  onChange={setBranchForm}
                  branchCount={branches.length}
                  onDelete={() => handleDeleteBranch(activeTab)}
                />
              ) : (
                <BranchViewPanel branch={currentBranch} />
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              「薬局を追加」ボタンから最初の薬局を登録してください
            </div>
          )}
        </div>
      </PharmacyLayout>
    </ProtectedRoute>
  );
}

// =========== 薬局表示パネル ===========
function BranchViewPanel({ branch }: { branch: PharmacyBranch }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
        <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 size={28} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{branch.name}</h3>
          <p className="text-gray-500 text-sm mt-1">
            {branch.prefecture}{branch.address ? ` ${branch.address}` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <Section icon={<Phone size={16} />} title="連絡先情報">
          <Row label="電話番号" value={branch.phoneNumber} />
          <Row label="FAX番号" value={branch.faxNumber} />
        </Section>

        <Section icon={<Clock size={16} />} title="営業情報">
          <Row
            label="営業時間"
            value={
              branch.businessHoursStart && branch.businessHoursEnd
                ? `${formatTime(branch.businessHoursStart)} - ${formatTime(branch.businessHoursEnd)}`
                : undefined
            }
          />
          <Row label="設立" value={branch.establishedDate ? formatDate(branch.establishedDate) : undefined} />
        </Section>

        <Section icon={<MapPin size={16} />} title="アクセス">
          <Row label="最寄り駅" value={branch.nearestStation} />
          <Row
            label="徒歩"
            value={branch.minutesFromStation != null ? `徒歩${branch.minutesFromStation}分` : undefined}
          />
          <Row
            label="車通勤"
            value={
              branch.carCommuteAvailable === true ? '可能' : branch.carCommuteAvailable === false ? '不可' : undefined
            }
          />
        </Section>

        <Section icon={<Users size={16} />} title="薬局規模">
          <Row
            label="処方箋枚数"
            value={branch.dailyPrescriptionCount ? `約${branch.dailyPrescriptionCount}枚/日` : undefined}
          />
          <Row label="スタッフ数" value={branch.staffCount ? `${branch.staffCount}名` : undefined} />
        </Section>
      </div>

      {(branch.introduction || branch.strengths || branch.equipmentSystems) && (
        <div className="pt-4 border-t border-gray-100 space-y-4">
          {branch.introduction && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <FileText size={16} />
                薬局の紹介
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap text-sm">{branch.introduction}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-6">
            {branch.strengths && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">強み・特色</h4>
                <p className="text-gray-700 whitespace-pre-wrap text-sm">{branch.strengths}</p>
              </div>
            )}
            {branch.equipmentSystems && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">設備・システム</h4>
                <p className="text-gray-700 whitespace-pre-wrap text-sm">{branch.equipmentSystems}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1 text-sm">
        {icon}
        {title}
      </h4>
      <div className="space-y-1 text-sm">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex">
      <span className="text-gray-500 w-28 flex-shrink-0">{label}:</span>
      <span className="text-gray-900">{value || '未設定'}</span>
    </div>
  );
}

// =========== 薬局編集フォーム ===========
function BranchEditForm({
  form,
  onChange,
  branchCount,
  onDelete,
}: {
  form: BranchForm;
  onChange: (f: BranchForm) => void;
  branchCount: number;
  onDelete: () => void;
}) {
  const set = (key: keyof BranchForm, value: any) => onChange({ ...form, [key]: value });

  return (
    <div className="space-y-8">
      {/* 薬局名 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 size={20} />
            基本情報
          </h3>
          {branchCount > 1 && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 size={15} />
              この薬局を削除
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">薬局名 *</label>
            <input
              type="text"
              value={form.name || ''}
              onChange={(e) => set('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：〇〇薬局 新宿店"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">都道府県</label>
            <input
              type="text"
              value={form.prefecture || ''}
              onChange={(e) => set('prefecture', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
            <input
              type="text"
              value={form.address || ''}
              onChange={(e) => set('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 連絡先 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Phone size={20} />
          連絡先情報
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
            <input
              type="tel"
              value={form.phoneNumber || ''}
              onChange={(e) => set('phoneNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">FAX番号</label>
            <input
              type="text"
              value={form.faxNumber || ''}
              onChange={(e) => set('faxNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 営業情報 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} />
          営業情報
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">営業開始時間</label>
            <input
              type="time"
              value={form.businessHoursStart || ''}
              onChange={(e) => set('businessHoursStart', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">営業終了時間</label>
            <input
              type="time"
              value={form.businessHoursEnd || ''}
              onChange={(e) => set('businessHoursEnd', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最寄り駅</label>
            <input
              type="text"
              value={form.nearestStation || ''}
              onChange={(e) => set('nearestStation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最寄り駅からの徒歩（分）</label>
            <input
              type="number"
              min={0}
              value={form.minutesFromStation ?? ''}
              onChange={(e) => set('minutesFromStation', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">車通勤</label>
            <select
              value={form.carCommuteAvailable === undefined ? '' : form.carCommuteAvailable ? 'yes' : 'no'}
              onChange={(e) =>
                set('carCommuteAvailable', e.target.value === '' ? undefined : e.target.value === 'yes')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">未選択</option>
              <option value="yes">可能</option>
              <option value="no">不可</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">設立日</label>
            <input
              type="date"
              value={form.establishedDate ? new Date(form.establishedDate).toISOString().split('T')[0] : ''}
              onChange={(e) => set('establishedDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">1日の処方箋枚数</label>
            <input
              type="number"
              value={form.dailyPrescriptionCount || ''}
              onChange={(e) => set('dailyPrescriptionCount', parseInt(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">スタッフ数</label>
            <input
              type="number"
              value={form.staffCount || ''}
              onChange={(e) => set('staffCount', parseInt(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 紹介 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText size={20} />
          薬局の紹介・特徴
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">薬局の紹介</label>
            <textarea
              rows={4}
              value={form.introduction || ''}
              onChange={(e) => set('introduction', e.target.value)}
              placeholder="薬局の特徴や雰囲気を説明してください"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">強み・特色</label>
            <textarea
              rows={3}
              value={form.strengths || ''}
              onChange={(e) => set('strengths', e.target.value)}
              placeholder="在宅医療、かかりつけ薬剤師など"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">設備・システム</label>
            <textarea
              rows={3}
              value={form.equipmentSystems || ''}
              onChange={(e) => set('equipmentSystems', e.target.value)}
              placeholder="電子薬歴システム、調剤機器など"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
