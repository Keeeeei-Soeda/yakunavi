# 応募フォームUI改善提案

## 現在の状態

現在の応募フォームは、以下の項目を一度に表示しています：

1. 最寄駅（必須）
2. 勤務経験のある業態（必須、複数選択可）
3. 意気込み・自己PR（任意・推奨）

これは設計書（pharmacist_system_design.md）の通りになっています。

## 改善提案

### 提案1: セクション分けとビジュアル改善

現在のフォームをより見やすく、わかりやすくするための改善案です。

#### 変更点
1. セクションごとに背景色を変える
2. 必須項目をより明確に表示
3. 入力のヒントを充実させる
4. バリデーションエラーをリアルタイム表示
5. 進捗状況を表示

#### 実装例

```tsx
{/* 応募確認ダイアログ */}
{showApplicationDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">応募情報の入力</h3>
        <p className="text-sm text-gray-600 mb-6">
          以下の情報を入力して、この求人に応募してください
        </p>

        {/* 進捗インジケーター */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">入力完了度</span>
            <span className="text-sm font-medium text-green-600">
              {calculateProgress()}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        {/* 資格証明書の警告（必要な場合） */}
        {!hasVerifiedCertificate && (
          <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-orange-900">
                  ⚠️ 資格証明書が未確認です
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  応募前に薬剤師免許証と保険薬剤師登録票をアップロードすることを強く推奨します。
                  <Link href="/pharmacist/profile" className="underline ml-1 font-medium" target="_blank">
                    プロフィールページで確認
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 応募先求人の確認 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            応募先求人
          </h4>
          <p className="font-medium text-lg text-gray-900">{job.title}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <p className="text-gray-700">
              <span className="font-medium">日給:</span> ¥{job.dailyWage.toLocaleString()}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">勤務日数:</span> {job.desiredWorkDays || 0}日
            </p>
            <p className="text-gray-700 col-span-2">
              <span className="font-medium">報酬総額:</span>{' '}
              <span className="text-green-600 font-semibold text-base">
                ¥{(job.dailyWage * (job.desiredWorkDays || 0)).toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        {/* セクション1: 基本情報 */}
        <div className="bg-gray-50 rounded-lg p-5 mb-5">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            基本情報
          </h4>

          {/* 最寄駅（必須） */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              最寄駅{' '}
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                必須
              </span>
            </label>
            <input
              type="text"
              value={applicationForm.nearestStation}
              onChange={(e) => setApplicationForm({ ...applicationForm, nearestStation: e.target.value })}
              placeholder="例：新宿駅、天王寺駅"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-base transition-colors ${
                applicationForm.nearestStation.trim()
                  ? 'border-green-300 focus:ring-green-500 bg-green-50'
                  : 'border-gray-300 focus:ring-green-500 bg-white'
              }`}
            />
            <div className="flex items-start gap-2 mt-2">
              <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600">
                通勤経路の確認のため、お住まいの最寄駅を入力してください（路線名は不要です）
              </p>
            </div>
            {applicationForm.nearestStation.trim() && (
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>入力完了</span>
              </div>
            )}
          </div>
        </div>

        {/* セクション2: 勤務経験 */}
        <div className="bg-gray-50 rounded-lg p-5 mb-5">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-green-600" />
            勤務経験のある業態{' '}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
              必須
            </span>
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            これまでに勤務経験のある業態を選択してください（複数選択可、最低1つ必須）
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {['調剤薬局', 'ドラッグストア', '病院薬剤部', '製薬企業', 'その他'].map((type) => (
              <label
                key={type}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  applicationForm.workExperienceTypes.includes(type)
                    ? 'bg-green-50 border-green-500 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={applicationForm.workExperienceTypes.includes(type)}
                  onChange={() => toggleWorkExperienceType(type)}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">{type}</span>
                  {applicationForm.workExperienceTypes.includes(type) && (
                    <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                  )}
                </div>
              </label>
            ))}
          </div>
          
          {applicationForm.workExperienceTypes.length > 0 && (
            <div className="flex items-center gap-1 mt-3 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>{applicationForm.workExperienceTypes.length}つの業態を選択中</span>
            </div>
          )}
        </div>

        {/* セクション3: 自己PR */}
        <div className="bg-blue-50 rounded-lg p-5 mb-5">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            意気込み・自己PR{' '}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              任意・推奨
            </span>
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            💡 具体的な経験やスキル、応募動機を記載すると採用率が上がります
          </p>
          
          <textarea
            value={applicationForm.coverLetter}
            onChange={(e) => setApplicationForm({ ...applicationForm, coverLetter: e.target.value })}
            placeholder="例：&#10;調剤薬局で5年の経験があります。&#10;在宅医療にも対応可能で、患者様とのコミュニケーションを大切にしています。&#10;貴局で経験を活かして貢献したいと考えております。"
            rows={6}
            className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none bg-white"
          />
          
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-600">
              推奨文字数: 100〜300文字
            </p>
            <p className={`text-xs font-medium ${
              applicationForm.coverLetter.length >= 100 && applicationForm.coverLetter.length <= 300
                ? 'text-green-600'
                : applicationForm.coverLetter.length > 300
                ? 'text-orange-600'
                : 'text-gray-500'
            }`}>
              {applicationForm.coverLetter.length}文字
            </p>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            重要な注意事項
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1 ml-5 list-disc">
            <li>応募後、薬局からメッセージが届く場合があります</li>
            <li><strong>一度応募したら、基本的に取り下げはできません</strong></li>
            <li>やむを得ずキャンセルが必要な場合は、運営（support@yakunavi.jp）までご連絡ください</li>
            <li>入力内容は薬局側に開示されます</li>
            <li>虚偽の情報を記載した場合、契約が取り消される場合があります</li>
          </ul>
        </div>

        {/* ボタン */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={() => setShowApplicationDialog(false)}
            disabled={applying}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 font-medium"
          >
            キャンセル
          </button>
          <button
            onClick={handleApply}
            disabled={
              applying ||
              !applicationForm.nearestStation.trim() ||
              applicationForm.workExperienceTypes.length === 0
            }
            className={`flex-1 px-6 py-3 rounded-lg transition-all font-medium flex items-center justify-center gap-2 ${
              !applicationForm.nearestStation.trim() || applicationForm.workExperienceTypes.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
            }`}
          >
            {applying ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                応募中...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                この内容で応募する
              </>
            )}
          </button>
        </div>

        {/* 必須項目の残り表示 */}
        {(!applicationForm.nearestStation.trim() || applicationForm.workExperienceTypes.length === 0) && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ 以下の必須項目を入力してください：
            </p>
            <ul className="text-sm text-red-700 ml-5 mt-1 list-disc">
              {!applicationForm.nearestStation.trim() && <li>最寄駅</li>}
              {applicationForm.workExperienceTypes.length === 0 && <li>勤務経験のある業態（最低1つ）</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  </div>
)}
```

#### 追加の関数

```typescript
// 入力完了度を計算
const calculateProgress = () => {
  let progress = 0;
  
  // 最寄駅（必須：40%）
  if (applicationForm.nearestStation.trim()) {
    progress += 40;
  }
  
  // 勤務経験のある業態（必須：40%）
  if (applicationForm.workExperienceTypes.length > 0) {
    progress += 40;
  }
  
  // 自己PR（任意：20%）
  if (applicationForm.coverLetter.trim()) {
    progress += 20;
  }
  
  return progress;
};
```

---

### 提案2: ステップ形式（複数ページ）

もし、より段階的な入力を望む場合は、ステップ形式も検討できます。

#### メリット
- 各項目に集中できる
- 入力ミスが減る
- モバイルでの入力がしやすい

#### デメリット
- ページ遷移が増える
- 全体像が見えにくい
- 実装が複雑

ただし、現在の項目数（3つ）では、ステップ形式は過剰かもしれません。

---

## 推奨事項

**提案1のセクション分けとビジュアル改善を推奨します。**

理由：
1. 現在の項目数（3つ）に適している
2. 全体像を一度に確認できる
3. 入力状況が分かりやすい
4. モダンなUIデザイン
5. ユーザビリティが向上

---

## 実装のポイント

1. **必須項目の明確化**
   - 赤い「必須」バッジを表示
   - 未入力時に分かりやすいエラー表示

2. **リアルタイムフィードバック**
   - 入力完了時にチェックマークを表示
   - 進捗状況を視覚的に表示

3. **ヘルプテキストの充実**
   - 各項目に具体的な入力例を表示
   - なぜその情報が必要かを説明

4. **アクセシビリティ**
   - 色だけでなくアイコンでも状態を表示
   - キーボード操作をサポート

5. **レスポンシブ対応**
   - モバイルでも見やすいレイアウト
   - タッチしやすいボタンサイズ

