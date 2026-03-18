# 薬剤師の応募画面フロー詳細

## 概要

薬剤師が求人に応募する際の画面フローと処理の詳細を記載します。

---

## 1. ページ初期化フロー

### 1.1 ページアクセス

- **URL**: `/pharmacist/jobs/[id]`
- **コンポーネント**: `frontend/app/pharmacist/jobs/[id]/page.tsx`

### 1.2 認証チェック

```typescript
// ProtectedRouteコンポーネントによる認証チェック
- 薬剤師としてログインしているか確認
- 未ログインの場合: `/pharmacist/login` にリダイレクト
```

### 1.3 初期データ取得（並列実行）

#### ① 求人詳細の取得

```typescript
fetchJobDetail()
  ↓
GET /api/job-postings/{jobId}
  ↓
求人情報をstateに保存
```

#### ② 薬剤師プロフィールの取得

```typescript
fetchProfile()
  ↓
GET /api/pharmacist-profile/{pharmacistId}
  ↓
プロフィール情報をstateに保存
  ↓
プロフィール情報を応募フォームのデフォルト値に設定
  ├─ 最寄駅（nearestStation）
  ├─ 勤務経験のある業態（workExperienceTypes）
  └─ 自己紹介（selfIntroduction → coverLetter）
```

#### ③ 資格証明書の取得

```typescript
fetchCertificates()
  ↓
GET /api/pharmacist-profile/{pharmacistId}/certificates
  ↓
証明書一覧をstateに保存
  ↓
証明書の確認状態をチェック
```

### 1.4 証明書確認状態の判定

```typescript
// 両方の証明書が承認済みかチェック
- 薬剤師免許証（license）: verificationStatus === 'verified'
- 保険薬剤師登録票（registration）: verificationStatus === 'verified'
- 両方承認済みの場合: hasVerifiedCertificate = true
```

---

## 2. 画面表示フロー

### 2.1 求人詳細情報の表示

#### 基本情報セクション

- 求人タイトル
- 勤務地（MapPinアイコン）
- 日給（DollarSignアイコン）
- 勤務日数（Calendarアイコン）
- 希望勤務時間（Clockアイコン）
- 募集期限

#### 報酬・勤務条件セクション

- 日給
- 勤務日数
- 報酬総額（日給 × 勤務日数）
- 希望勤務時間
- 勤務開始可能期間（開始日 〜 終了日）

#### 薬局情報セクション

- 薬局名
- 都道府県
- 「薬局の詳細を見る」ボタン（モーダル表示）

#### 求人詳細セクション

- 求人の説明文（description）

#### 応募条件セクション

- 応募条件・その他（requirements）

#### 勤務地情報セクション

- 勤務地の詳細情報

### 2.2 資格証明書の警告表示

#### 条件

- `hasVerifiedCertificate === false` の場合に表示

#### 表示内容

```
⚠️ 資格証明書が未確認です
応募前に資格証明書をアップロードすることを強く推奨します。
[プロフィールページへ]リンク
```

### 2.3 応募ボタンの表示

- ページ上部（ヘッダー横）
- ページ下部（中央配置）
- 両方のボタンで同じモーダルを開く

---

## 3. 応募フォーム表示フロー

### 3.1 モーダル表示

- 「応募する」ボタンクリック
- `showApplicationDialog = true` に設定
- モーダルが表示される

### 3.2 モーダル内の構成

#### ① ヘッダー

- タイトル: "応募情報の入力"
- 閉じるボタン（×）

#### ② 資格証明書の警告（条件付き）

- `hasVerifiedCertificate === false` の場合のみ表示
- 警告メッセージとプロフィールページへのリンク

#### ③ 応募先求人の確認

- 求人タイトル
- 報酬情報（日給 × 日数 = 総額）

#### ④ 基本情報セクション

- **最寄駅**（必須）
  - テキスト入力フィールド
  - プロフィールの最寄駅が自動的にデフォルト値として設定される
  - プレースホルダー: "例: 新宿駅"
  - **自動反映**: プロフィールに最寄駅が登録されている場合、自動的に入力される

#### ⑤ 経歴セクション

- **勤務経験のある業態**（必須、複数選択可）
  - チェックボックス形式
  - 選択肢:
    - 調剤薬局
    - ドラッグストア
    - 病院薬剤部
    - 製薬企業
    - その他
  - 最低1つ選択必須
  - **自動反映**: プロフィールに勤務経験のある業態が登録されている場合、自動的にチェックされる

#### ⑥ 自己紹介セクション

- **意気込み・自己PR**（任意）
  - テキストエリア（6行）
  - プレースホルダー: "調剤薬局での経験やスキル、応募動機などを記載してください"
  - **自動反映**: プロフィールの自己紹介（selfIntroduction）が登録されている場合、自動的に入力される

#### ⑦ 注意事項

- 黄色背景の警告ボックス
- 内容:
  - 応募後、薬局からメッセージが届く場合があります
  - やむを得ずキャンセルが必要な場合は、運営（info@yaku-navi.com）までご連絡ください
  - 入力内容は薬局側に開示されます
  - 虚偽の情報を記載した場合、契約が取り消される場合があります

#### ⑧ ボタン

- **キャンセル**: モーダルを閉じる
- **保存**: 応募を送信（必須項目が入力済みの場合のみ有効）

---

## 4. 応募送信フロー

### 4.1 バリデーション（フロントエンド）

#### ① ログイン状態チェック

```typescript
if (!pharmacistId) {
  alert("ログイン情報が取得できません。再度ログインしてください。");
  router.push("/pharmacist/login");
  return;
}
```

#### ② 最寄駅の入力チェック

```typescript
if (!applicationForm.nearestStation.trim()) {
  alert("最寄駅を入力してください");
  return;
}
```

#### ③ 勤務経験のある業態の選択チェック

```typescript
if (applicationForm.workExperienceTypes.length === 0) {
  alert("勤務経験のある業態を最低1つ選択してください");
  return;
}
```

#### ④ 資格証明書の確認チェック（警告のみ）

```typescript
const verifiedCerts = certificates.filter(
  (c) => c.verificationStatus === "verified",
);
if (verifiedCerts.length === 0) {
  if (
    !confirm(
      "資格証明書が未確認です。プロフィールページで証明書をアップロードしてください。\n\nそれでも応募しますか？",
    )
  ) {
    return;
  }
}
```

#### ⑤ 最終確認

```typescript
if (!confirm("この求人に応募しますか？")) {
  return;
}
```

### 4.2 APIリクエスト送信

#### リクエスト内容

```typescript
POST /api/applications
Content-Type: application/json

{
  jobPostingId: number,
  pharmacistId: number,
  nearestStation: string,
  workExperienceTypes: string[],
  coverLetter?: string
}
```

#### 送信前の状態管理

```typescript
setApplying(true); // ローディング状態に設定
```

### 4.3 バックエンド処理フロー

#### ① 認証・権限チェック

```typescript
// ApplicationController.createApplication
- リクエストユーザーが薬剤師か確認
- 薬剤師でない場合: 403エラー
```

#### ② 薬剤師プロフィールの取得

```typescript
// ApplicationService.createApplication
const pharmacist = await prisma.pharmacist.findUnique({
  where: { id: pharmacistId },
});

if (!pharmacist) {
  throw new Error("薬剤師プロフィールが見つかりません");
}
```

#### ③ 資格証明書の確認チェック（バックエンド）

```typescript
if (pharmacist.verificationStatus !== "verified") {
  throw new Error("応募するには資格証明書のアップロードと確認が必要です");
}
```

**注意**: フロントエンドでは警告のみだが、バックエンドでは必須チェック

#### ④ 必須項目の最終チェック

```typescript
// プロフィールから取得した値も考慮
const finalNearestStation = nearestStation || pharmacist.nearestStation;
const finalWorkExperienceTypes =
  workExperienceTypes || pharmacist.workExperienceTypes;

if (!finalNearestStation) {
  throw new Error("最寄駅の入力が必要です");
}

if (!finalWorkExperienceTypes || finalWorkExperienceTypes.length === 0) {
  throw new Error("勤務経験のある業態を最低1つ選択してください");
}
```

#### ⑤ 求人の存在確認

```typescript
const jobPosting = await prisma.jobPosting.findUnique({
  where: { id: jobPostingId },
});

if (!jobPosting) {
  throw new Error("求人が見つかりません");
}
```

#### ⑥ 求人の公開状態確認

```typescript
if (jobPosting.status !== "published") {
  throw new Error("この求人は現在応募できません");
}
```

#### ⑦ 重複応募チェック

```typescript
const existingApplication = await prisma.application.findFirst({
  where: {
    jobPostingId,
    pharmacistId,
  },
});

if (existingApplication) {
  throw new Error("既にこの求人に応募済みです");
}
```

#### ⑧ 応募レコードの作成

```typescript
const application = await prisma.application.create({
  data: {
    jobPostingId,
    pharmacistId,
    coverLetter,
    nearestStation: finalNearestStation,
    status: "applied", // 初期ステータス
    appliedAt: new Date(),
  },
  include: {
    jobPosting: {
      select: {
        id: true,
        title: true,
        pharmacy: {
          select: {
            id: true,
            pharmacyName: true,
          },
        },
      },
    },
  },
});
```

**注意**: `workExperienceTypes`は応募レコードには保存されず、薬剤師プロフィールに保存される想定

#### ⑨ レスポンス返却

```typescript
return {
  success: true,
  message: "応募を送信しました",
  data: application,
};
```

### 4.4 フロントエンドでのレスポンス処理

#### 成功時

```typescript
if (response.success) {
  alert("応募が完了しました");
  router.push("/pharmacist/applications"); // 応募一覧ページへ遷移
}
```

#### エラー時

```typescript
catch (error: any) {
  console.error('Failed to apply:', error);
  alert(error.response?.data?.error || '応募に失敗しました');
}
```

#### 最終処理

```typescript
finally {
  setApplying(false); // ローディング状態を解除
}
```

---

## 5. エラーハンドリング

### 5.1 フロントエンドでのエラー

| エラー内容         | 処理                             |
| ------------------ | -------------------------------- |
| ログイン情報なし   | ログインページへリダイレクト     |
| 最寄駅未入力       | アラート表示、処理中断           |
| 勤務経験未選択     | アラート表示、処理中断           |
| 資格証明書未確認   | 確認ダイアログ表示、ユーザー選択 |
| 最終確認キャンセル | 処理中断                         |

### 5.2 バックエンドでのエラー

| エラー内容             | HTTPステータス | エラーメッセージ                                     |
| ---------------------- | -------------- | ---------------------------------------------------- |
| 薬剤師でない           | 403            | 薬剤師アカウントのみアクセス可能です                 |
| 薬剤師プロフィールなし | 400            | 薬剤師プロフィールが見つかりません                   |
| 資格証明書未確認       | 400            | 応募するには資格証明書のアップロードと確認が必要です |
| 最寄駅未入力           | 400            | 最寄駅の入力が必要です                               |
| 勤務経験未選択         | 400            | 勤務経験のある業態を最低1つ選択してください          |
| 求人不存在             | 400            | 求人が見つかりません                                 |
| 求人未公開             | 400            | この求人は現在応募できません                         |
| 重複応募               | 400            | 既にこの求人に応募済みです                           |

---

## 6. データフロー図

```
[薬剤師] → [求人詳細ページ]
    ↓
[応募ボタンクリック]
    ↓
[モーダル表示]
    ↓
[フォーム入力]
    ├─ 最寄駅（必須）
    ├─ 勤務経験のある業態（必須、複数選択）
    └─ 意気込み・自己PR（任意）
    ↓
[バリデーション]
    ├─ フロントエンドチェック
    └─ 最終確認ダイアログ
    ↓
[APIリクエスト送信]
    POST /api/applications
    ↓
[バックエンド処理]
    ├─ 認証チェック
    ├─ 薬剤師プロフィール取得
    ├─ 資格証明書確認チェック
    ├─ 必須項目チェック
    ├─ 求人存在確認
    ├─ 求人公開状態確認
    ├─ 重複応募チェック
    └─ 応募レコード作成
    ↓
[レスポンス]
    ├─ 成功: 応募一覧ページへ遷移
    └─ エラー: エラーメッセージ表示
```

---

## 7. 状態管理

### 7.1 コンポーネントのstate

```typescript
// 求人情報
const [job, setJob] = useState<JobPosting | null>(null);
const [loading, setLoading] = useState(true);

// 応募フォーム
const [showApplicationDialog, setShowApplicationDialog] = useState(false);
const [applying, setApplying] = useState(false);
const [applicationForm, setApplicationForm] = useState({
  nearestStation: "",
  workExperienceTypes: [] as string[],
  coverLetter: "",
});

// プロフィール情報
const [profile, setProfile] = useState<any>(null);
const [certificates, setCertificates] = useState<any[]>([]);

// 薬局情報
const [showPharmacyModal, setShowPharmacyModal] = useState(false);
const [pharmacyProfile, setPharmacyProfile] = useState<PharmacyProfile | null>(
  null,
);
```

### 7.2 認証情報

```typescript
const user = useAuthStore((state) => state.user);
const pharmacistId = user?.relatedId;
```

---

## 8. UI/UXの特徴

### 8.1 視覚的フィードバック

- ローディング状態: `applying` が `true` の時、ボタンに「応募中...」と表示
- 必須項目のマーキング: 赤いアスタリスク（\*）で表示
- 選択状態の視覚化: チェックボックス選択時、背景色が青に変化

### 8.2 ユーザビリティ

- プロフィールの最寄駅を自動入力
- 資格証明書未確認時の警告表示
- 注意事項の明確な表示
- モーダル形式で集中して入力可能

### 8.3 エラー防止

- 必須項目未入力時は送信ボタン無効化
- 複数段階のバリデーション
- 最終確認ダイアログ

---

## 9. 関連ファイル

### フロントエンド

- `frontend/app/pharmacist/jobs/[id]/page.tsx` - 求人詳細・応募ページ
- `frontend/lib/api/applications.ts` - 応募APIクライアント

### バックエンド

- `backend/src/routes/application.routes.ts` - 応募ルーティング
- `backend/src/controllers/application.controller.ts` - 応募コントローラー
- `backend/src/services/application.service.ts` - 応募ビジネスロジック

### 設計書

- `pharmacist_system_design.md` - 薬剤師システム設計書

---

## 10. 注意事項

### 10.1 資格証明書の確認

- フロントエンドでは警告のみだが、バックエンドでは必須チェック
- 両方の証明書（薬剤師免許証・保険薬剤師登録票）が承認済みである必要がある

### 10.2 重複応募の防止

- 同じ求人への重複応募は不可
- バックエンドで厳密にチェック

### 10.3 応募の取り下げ

- 一度応募したら、基本的に取り下げはできない
- やむを得ない場合は運営（info@yaku-navi.com）まで連絡が必要

### 10.4 データの保存

- `workExperienceTypes`は応募レコードには保存されない（薬剤師プロフィールに保存される想定）
- `nearestStation`は応募レコードに保存される

---

## 11. 今後の改善点

1. **リアルタイムバリデーション**: 入力中にリアルタイムでエラー表示
2. **進捗表示**: フォーム入力の進捗状況を表示
3. **下書き保存**: 応募情報を一時保存できる機能
4. **応募履歴**: 過去の応募内容を確認できる機能
