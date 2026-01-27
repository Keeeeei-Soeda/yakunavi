# 薬局ダッシュボードAPI実装完了

## 実装内容

### 新規作成ファイル

1. **`backend/src/controllers/pharmacy.controller.ts`**
   - ダッシュボード統計取得
   - 最近の応募取得
   - アクティブな求人取得

2. **`backend/src/services/pharmacy.service.ts`**
   - 統計データの集計ロジック
   - データベースクエリの実装

3. **`backend/src/routes/pharmacy.routes.ts`**
   - APIエンドポイントの定義
   - 認証・認可ミドルウェアの適用

### 実装したAPIエンドポイント

#### 1. ダッシュボード統計
```
GET /api/pharmacy/dashboard/:pharmacyId/stats
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "activeJobPostings": 2,
    "totalApplications": 5,
    "activeContracts": 3,
    "pendingContracts": 1
  }
}
```

#### 2. 最近の応募
```
GET /api/pharmacy/dashboard/:pharmacyId/recent-applications?limit=5
```

**レスポンス:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": "applied",
      "appliedAt": "2026-01-27T...",
      "jobPosting": {
        "id": 1,
        "title": "調剤薬局での短期勤務募集"
      },
      "pharmacist": {
        "id": 1,
        "lastName": "山田",
        "firstName": "一郎",
        "age": 39,
        "workExperienceYears": 15
      }
    }
  ]
}
```

#### 3. アクティブな求人
```
GET /api/pharmacy/dashboard/:pharmacyId/active-job-postings?limit=5
```

**レスポンス:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "調剤薬局での短期勤務募集",
      "workLocation": "東京都新宿区新宿1-1-1",
      "dailyWage": 25000,
      "desiredWorkDays": 30,
      "status": "published",
      "publishedAt": "2026-01-27T...",
      "applicationCount": 2
    }
  ]
}
```

### 認証・認可

すべてのエンドポイントは以下の保護を受けています：
- ✅ JWT認証が必要
- ✅ 薬局ユーザーのみアクセス可能
- ✅ 自身の薬局IDのデータのみ取得可能

### 修正したファイル

**`backend/src/index.ts`**
- pharmacy ルートを追加

### テスト方法

1. 薬局アカウントでログイン
   ```bash
   curl -X POST http://localhost:5001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "pharmacy1@test.com", "password": "password123"}'
   ```

2. 取得したトークンを使用してダッシュボードAPIを呼び出し
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5001/api/pharmacy/dashboard/1/stats
   ```

### 動作確認

- ✅ バックエンドAPI実装完了
- ✅ フロントエンドとの統合確認
- ✅ エラーハンドリング実装
- ✅ 認証・認可実装

## 次のステップ

ブラウザで http://localhost:3000/pharmacy/dashboard にアクセスし、ログインしてダッシュボードが正しく表示されることを確認してください。

