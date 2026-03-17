# 1法人・複数薬局対応 — 実装見通し

## 1. 概要

- **現状**: 1法人（1アカウント）= 1薬局。プロフィール編集は1薬局分のみ。
- **要望**:
  - 1法人で**複数薬局**の情報を登録・管理できるようにする。
  - プロフィール編集画面は**タブで薬局を切り替え**（薬局1・薬局2…）、画面遷移なしで同一画面内で確認・編集。
  - 求人票は**薬局ごとに選択**して掲載（どの薬局の求人か明示）。
- **薬局ごとの登録情報**: 各薬局（Branch）で登録する項目は**現在のプロフィールと同一**とする。項目の追加・削減は行わない。

---

## 2. データモデル変更

### 2.1 方針

- **Pharmacy** = 法人（アカウント単位）。`User` と 1:1 のまま。
- **PharmacyBranch**（新規）= 薬局（店舗）単位。1法人が複数持つ。

| 役割 | 現在 | 変更後 |
|------|------|--------|
| ログイン・請求・契約の主体 | Pharmacy | Pharmacy（法人）のまま |
| プロフィールの「1店舗分」の情報 | Pharmacy に全項目 | PharmacyBranch に移す |
| 求人票の「勤務先」 | Pharmacy に紐づく | **PharmacyBranch** に紐づく |

### 2.2 新規モデル: PharmacyBranch

**薬局ごとの登録情報は現在のプロフィールと同一**とする。項目の増減は行わない。

```
PharmacyBranch（現在の薬局プロフィール項目をそのまま1薬局分として持つ）
├── id (PK)
├── pharmacyId (FK → Pharmacy)   ※どの法人の薬局か
├── name (薬局名。例: 〇〇薬局 新宿店)  ※現行の pharmacyName に相当
├── prefecture, address, nearestStation, minutesFromStation, carCommuteAvailable
├── phoneNumber, faxNumber
├── establishedDate, dailyPrescriptionCount, staffCount
├── businessHoursStart, businessHoursEnd
├── introduction, strengths, equipmentSystems
├── displayOrder (Int, 任意)  ※タブ並び順
├── createdAt, updatedAt
└── 関係: pharmacy (Pharmacy), jobPostings (JobPosting[])
```

- 法人共通項目（法人名・代表者名）は **Pharmacy** に残す。
- 上記のとおり、**各 Branch の登録項目は現行の薬局プロフィールと同じ**。現在 Pharmacy にある「薬局ごとの項目」をそのまま **PharmacyBranch** に移す（後述の移行でコピー）。

### 2.3 Pharmacy モデルの変更

- **残す**: `id`, `userId`, `companyName`, `representativeLastName`, `representativeFirstName`
- **削除（Branch へ移行）**:  
  `pharmacyName`, `phoneNumber`, `faxNumber`, `prefecture`, `address`,  
  `nearestStation`, `minutesFromStation`, `carCommuteAvailable`,  
  `establishedDate`, `dailyPrescriptionCount`, `staffCount`,  
  `businessHoursStart`, `businessHoursEnd`, `introduction`, `strengths`, `equipmentSystems`
- **追加**: `branches PharmacyBranch[]` のリレーション

※ 既存データ移行まわりは「5. 移行」で記載。

### 2.4 JobPosting の変更

- **追加**: `pharmacyBranchId` (FK → PharmacyBranch, 必須にしたいが移行の都合で一時 nullable も可)
- **維持**: `pharmacyId`（法人単位の集計・一覧用。branch から導出も可だが、冗長で持っておくと楽）
- 求人作成・編集時は「どの薬局（Branch）の求人か」を選択。一覧・詳細では薬局名・住所は Branch から表示。

### 2.5 Contract / Payment / Document / Penalty

- **Contract**: 現状どおり `pharmacyId`（法人）のまま。表示用に「どの薬局の契約か」は `jobPosting.pharmacyBranchId` から取得。
- **Payment / Document / Penalty**: いったん `pharmacyId` のまま（法人単位で問題なければ変更不要）。必要になったら branch を表示用に join する程度で対応可能。

---

## 3. API 設計

### 3.1 薬局（Branch）CRUD

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/pharmacy/branches` または `/pharmacy/:pharmacyId/branches` | 法人に紐づく薬局一覧（タブ用） |
| GET | `/pharmacy/branch/:branchId` | 1薬局の詳細（編集フォーム用） |
| POST | `/pharmacy/branch` | 薬局追加（body に pharmacyId） |
| PUT | `/pharmacy/branch/:branchId` | 薬局更新 |
| DELETE | `/pharmacy/branch/:branchId` | 薬局削除（求人未使用など条件あり） |

- 認可: 自法人の `pharmacyId` に属する branch のみ操作可能にする。

### 3.2 プロフィール取得の整理

- **現行**: `GET /pharmacy/profile/:pharmacyId` → 1薬局分の情報を返している。
- **変更後**:
  - 法人＋全薬局をまとめて返す:  
    `GET /pharmacy/profile/:pharmacyId` → `{ company: Pharmacy, branches: PharmacyBranch[] }`
  - または「プロフィール」= 法人情報＋薬局一覧とし、各薬局の詳細は `GET /pharmacy/branch/:branchId` に寄せる。

### 3.3 公開プロフィール（薬剤師向け）

- **現行**: `GET /pharmacy/public-profile/:pharmacyId` で 1 薬局分表示。
- **変更後**: 求人・契約は「薬局（Branch）」単位なので、  
  `GET /pharmacy/public-profile/branch/:branchId` で**薬局単位**の公開プロフィールを返す。
- 求人詳細・契約詳細では `jobPosting.pharmacyBranchId` を使って上記を呼ぶ。

---

## 4. フロントエンド

### 4.1 プロフィール編集画面（要望どおりタブで同一画面）

- **レイアウト**
  - 上段: 法人名・代表者名（共通。Pharmacy のまま編集可能にするか、読み取り専用にするかは仕様次第）
  - タブ: 「薬局1」「薬局2」… は **Branch の name** または「薬局1」「薬局2」のラベルで表示。タブ切り替えで**画面遷移なし**に同一ページ内で表示・編集。
- **表示・編集**
  - 選択中タブの薬局 = 1つの Branch。**入力項目は現在のプロフィール編集画面と同じ**（基本情報・代表者情報・連絡先・営業情報・紹介・強み・設備など）をその Branch 用に表示・保存。
  - 「薬局を追加」ボタンで新規 Branch 作成 → 新タブが増える。
  - タブごとに「削除」は、求人に未使用など条件を満たす場合のみ許可する想定。
- **API 利用**
  - 初回: `GET /pharmacy/profile/:pharmacyId`（法人＋branches 一覧）または `GET /pharmacy/:pharmacyId/branches` でタブ一覧取得。
  - タブ選択時: 既に一覧で取得していればそのまま表示。詳細が必要なら `GET /pharmacy/branch/:branchId`。
  - 保存: `PUT /pharmacy/branch/:branchId`（新規は `POST /pharmacy/branch`）。

### 4.2 求人票の「薬局」選択

- **新規作成・編集**
  - フォーム先頭（または勤務地の近く）に「勤務薬局」として、**同一法人の Branch 一覧**をセレクトボックスで表示。
  - 選択した Branch を `pharmacyBranchId` として送信。`workLocation` は Branch の住所で初期値設定しつつ、必要なら手修正可能にしてもよい。
- **一覧・詳細**
  - 求人カード／詳細に「〇〇薬局 新宿店」のように Branch 名（と必要なら住所）を表示。データは `jobPosting.pharmacyBranch` から取得。

### 4.3 その他画面

- **サイドバー**: 法人名（`Pharmacy.companyName`）表示のままでよい。
- **薬剤師向け**: 求人詳細・契約詳細で「この薬局のプロフィール」を表示する際は、`getPublicProfile(branchId)` のような API で Branch 単位の公開情報を取得。

---

## 5. データ移行（マイグレーション）

1. **PharmacyBranch テーブル追加**  
   - 上記スキーマで作成。
2. **既存 Pharmacy から 1 Branch を生成**  
   - 各 Pharmacy に対して、現在の `pharmacyName` 以降の項目を 1 件の PharmacyBranch にコピー。  
   - `name` は `pharmacyName` が null の場合は `companyName + ' 本店'` などで補う。
3. **JobPosting に pharmacyBranchId 追加**  
   - nullable で追加し、既存求人については「その法人の最初の Branch」を設定する UPDATE を実行。
4. **公開プロフィールの呼び出し先変更**  
   - 求人・契約から「薬局プロフィール」を表示する箇所を、`pharmacyId` ではなく `pharmacyBranchId`（または `jobPosting.pharmacyBranchId`）ベースに切り替え。
5. **Pharmacy から Branch に移したカラムの削除**  
   - 運用が安定したら、Pharmacy から `pharmacyName` 以下の不要カラムを削除するマイグレーションを実行（任意のタイミングで可）。

---

## 6. 実装順序の目安

| 順序 | 内容 | 備考 |
|------|------|------|
| 1 | スキーマ: PharmacyBranch 追加、JobPosting に pharmacyBranchId 追加 | 移行用に Pharmacy の既存カラムは一旦残す |
| 2 | 移行スクリプト: 既存 Pharmacy → 1 Branch 作成、既存 JobPosting に branchId 設定 | |
| 3 | バックエンド: Branch CRUD API、プロフィール取得の「法人＋branches」対応 | |
| 4 | バックエンド: 公開プロフィールを branch 単位で返す API | |
| 5 | フロント: プロフィール編集をタブ＋Branch 編集に変更 | 画面遷移なし・同一画面内 |
| 6 | フロント: 求人作成・編集で「勤務薬局」選択、一覧・詳細で Branch 名表示 | |
| 7 | フロント: 薬剤師側で求人・契約の「薬局プロフィール」を Branch 基準に変更 | |
| 8 | （任意）Pharmacy から Branch に移したカラム削除 | 後からでも可 |

---

## 7. リスク・注意点

- **既存データ**: 1法人1薬局のデータは「1 Branch」にまとめて移行するため、既存ユーザーはそのまま「薬局1」タブ1つのように見える形にできる。
- **求人と Branch**: Branch を削除する場合は、その Branch に紐づく求人が「下書き or 終了」など条件を満たす場合に限定するなど、ビジネスルールを決めておく。
- **公開プロフィール URL**: これまで `pharmacyId` で取得していた箇所を `branchId` に変えるため、薬剤師向けのブックマークやリンクがあれば影響範囲を確認する。

---

## 8. まとめ

- **データ**: 法人 = `Pharmacy`、薬局 = `PharmacyBranch` の 1:N を新設。求人は `pharmacyBranchId` で薬局を指定。
- **薬局ごとの登録情報**: 各薬局（Branch）の登録項目は**現在のプロフィールと同一**。項目の追加・削減は行わない。
- **UI**: プロフィール編集はタブで複数薬局を同一画面内で編集（各タブのフォームは現行と同じ項目）。求人では薬局（Branch）を選択して掲載。
- **移行**: 既存は 1 法人につき 1 Branch を生成し、既存求人にその Branch を紐づければ、現行の挙動を維持しつつ拡張できる。

この見通しに沿って、スキーマ変更と移行から着手すると実装が進めやすいです。
