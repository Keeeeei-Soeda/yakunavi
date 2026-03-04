# 使い方ガイド スクリーンショット ファイル名一覧

ガイドページで使用するスクリーンショットは、以下のファイル名で格納してください。  
格納場所は **`frontend/public/guide/`** です。

- **薬局向け**: `frontend/public/guide/pharmacy/`
- **薬剤師向け**: `frontend/public/guide/pharmacist/`

形式は **PNG** または **WebP** を推奨します（例: `login.png`）。

---

## 薬局向けガイド（/pharmacy/guide）

| ファイル名 | 説明 |
|-----------|------|
| `pharmacy/login.png` | ログイン画面 |
| `pharmacy/profile.png` | プロフィール管理画面 |
| `pharmacy/job-create.png` | 求人票作成画面 |
| `pharmacy/job-list.png` | 求人票一覧画面 |
| `pharmacy/applications-list.png` | 応募一覧画面 |
| `pharmacy/application-detail.png` | 応募詳細画面（メッセージ・却下ボタン） |
| `pharmacy/messages.png` | メッセージ画面 |
| `pharmacy/offer-send.png` | 正式オファー送信画面 |
| `pharmacy/date-proposal.png` | 初回出勤日候補送付画面 |
| `pharmacy/contracts-list.png` | 契約管理一覧画面 |
| `pharmacy/contract-detail.png` | 契約詳細画面 |
| `pharmacy/payments-list.png` | 請求書管理画面 |
| `pharmacy/invoice-preview.png` | 請求書プレビュー画面 |
| `pharmacy/settings.png` | 設定画面 |

---

## 薬剤師向けガイド（/pharmacist/guide）

| ファイル名 | 説明 |
|-----------|------|
| `pharmacist/register.png` | 新規登録画面 |
| `pharmacist/login.png` | ログイン画面 |
| `pharmacist/profile-edit.png` | プロフィール入力画面 |
| `pharmacist/certificate-upload.png` | 書類アップロード画面 |
| `pharmacist/jobs-list.png` | 求人一覧画面 |
| `pharmacist/job-detail.png` | 求人詳細画面 |
| `pharmacist/favorites.png` | ダッシュボードのお気に入り一覧 |
| `pharmacist/apply-form.png` | 応募フォーム画面 |
| `pharmacist/applications-status.png` | 応募管理画面（ステータス表示） |
| `pharmacist/messages-list.png` | メッセージ画面（会話一覧） |
| `pharmacist/messages-chat.png` | メッセージ詳細（チャット画面） |
| `pharmacist/offer-received.png` | 正式オファー受け取り画面 |
| `pharmacist/date-select.png` | 初回出勤日選択画面 |
| `pharmacist/contracts-list.png` | 契約管理一覧画面 |
| `pharmacist/contract-detail.png` | 契約詳細（薬局連絡先）画面 |
| `pharmacist/contract-status-filter.png` | ステータスフィルタ画面 |
| `pharmacist/dashboard.png` | ダッシュボード全体 |
| `pharmacist/notifications.png` | 通知一覧ページ |

---

## 画像の参照パス

Next.js の `public` フォルダに置いたファイルは、ルートから参照します。

- 例: `public/guide/pharmacy/login.png` → 参照パスは **`/guide/pharmacy/login.png`**
- 例: `public/guide/pharmacist/dashboard.png` → 参照パスは **`/guide/pharmacist/dashboard.png`**

プレースホルダーを画像に差し替える際は、上記パスを `src` に指定してください。
