# MDファイル整理の棚卸し

重要度が低いファイルと、マージ候補を整理しました。

---

## 1. 重要度が低いファイル（過去の修正履歴・一時サマリー・リスト）

### 1.1 過去の修正履歴・一時対応メモ（削除 or `docs/archive/` 移動候補）

| ファイル                                    | 内容                                     | 提案                         |
| ------------------------------------------- | ---------------------------------------- | ---------------------------- |
| `BACKEND_STARTUP_SUCCESS.md`                | 起動時スキーマ修正メモ                   | 削除                         |
| `FRONTEND_BUILD_FIX.md`                     | framer-motion 未インストール対応         | 削除                         |
| `BIGINT_FIX_SUMMARY.md`                     | BigInt シリアライズ修正メモ              | 削除 o                       |
| `DESIGN_COMPLIANCE_CHECK.md`                | 設計書との整合性チェック結果（日付付き） | 削除                         |
| `FINAL_CHECK.md`                            | 最終チェックリスト結果（2026-01-27）     | 削除                         |
| `SERVER_STATUS.md`                          | サーバー起動状況・テストアカウントメモ   | 削除                         |
| `MODIFICATION_SUMMARY_20260128.md`          | 日付付き修正概要                         | 削除                         |
| `IMPLEMENTATION_STATUS_20260214.md`         | 日付付き実装状況                         | 削除                         |
| `IMPLEMENTATION_PROGRESS.md`                | 実装進捗レポート                         | 削除                         |
| `IMPLEMENTATION_SUMMARY.md`                 | 実装完了サマリー（FINAL と重複）         | 削除                         |
| `FINAL_IMPLEMENTATION_SUMMARY.md`           | 最終実装サマリー（古い）                 | 削除                         |
| `MESSAGE_FEATURE_UPDATE.md`                 | メッセージ機能アップデート履歴           | 削除                         |
| `MESSAGE_IMPLEMENTATION_STATUS.md`          | メッセージ実装状況（設計書照合）         | 削除                         |
| `DASHBOARD_API_IMPLEMENTATION.md`           | ダッシュボードAPI実装メモ                | 削除                         |
| `OFFER_AND_MESSAGE_CLOSE_IMPLEMENTATION.md` | オファー・メッセージクローズ実装メモ     | 削除                         |
| `DEPLOY_LABOR_CONDITIONS.md`                | 労働条件通知書デプロイ手順（単発）       | DEPLOYMENT.md に統合後は削除 |
| `BACKEND_ENV_CHECK.md`                      | 環境チェックメモ                         | 削除                         |

### 1.2 見通し・提案系（実装済みなら参照用に留める or 削除）

| ファイル                                     | 内容                      | 提案                                     |
| -------------------------------------------- | ------------------------- | ---------------------------------------- |
| `docs/PHARMACIST_APPLIED_JOBS_UX_OUTLOOK.md` | 応募済み求人UX改善見通し  |  削除                     |
| `docs/PAYMENT_REPORT_EMAIL_OUTLOOK.md`       | 支払い報告メール見通し    |  削除                     |
| `docs/GOOGLE_ANALYTICS_OUTLOOK.md`           | GA4設置見通し             |  削除                     |
| `docs/PHARMACY_MULTI_BRANCH_OUTLOOK.md`      | 1法人・複数薬局対応見通し | 将来参照用として残す  |
| `APPLICATION_FORM_UI_IMPROVEMENT.md`         | 応募フォームUI改善提案    | 削除                                     |

### 1.3 その他

| ファイル                                 | 内容                   | 提案                                  |
| ---------------------------------------- | ---------------------- | ------------------------------------- |
| `□ 個人情報保護方針（ドラフト）.md`      | ドラフト               | 削除  |
| `LP_page/images/必要な画像ファイル名.md` | LP画像ファイル名リスト |削除 |

---

## 2. マージできるファイル

### 2.1 管理者系 → 1本化

| 現状                              | 内容                                         | マージ先案                                         |
| --------------------------------- | -------------------------------------------- | -------------------------------------------------- |
| `ADMIN_SYSTEM_COMPLETE.md`        | 管理者システム実装完了・ログイン情報・使い方 | **docs/ADMIN.md**（新規）に統合                    |
| `ADMIN_IMPLEMENTATION_SUMMARY.md` | 実装サマリー・API・UI一覧                    | 上に統合                                           |
| `docs/ADMIN_LOGIN_INFO.md`        | 管理者ログイン情報・トラブルシューティング   | 上に統合                                           |
| `FIX_ADMIN_LOGIN.md`              | 管理者ログイン問題の修正手順                 | 上に「トラブルシューティング」として統合           |
| `DEPLOY_CHECKLIST.md`             | 管理者システムデプロイチェックリスト         | DEPLOYMENT.md に「管理者デプロイ」節を追加して統合 |

→ **docs/ADMIN.md** に「管理者機能・ログイン・運用・トラブルシューティング」をまとめ、元ファイルは削除 or リンクのみ残す。

### 2.2 起動・セットアップ系 → 1本化

| 現状               | 内容                                        | マージ先案                                                             |
| ------------------ | ------------------------------------------- | ---------------------------------------------------------------------- |
| `SETUP.md`         | セットアップガイド（DB・backend・frontend） | **README.md** の「セットアップ」に統合、または **docs/SETUP.md** 1本に |
| `QUICK_START.md`   | クイックスタート（起動コマンド・URL）       | 上に「クイックスタート」節として統合                                   |
| `START_SERVERS.md` | サーバー起動手順                            | 上に統合                                                               |

→ **README.md** に「クイックスタート」「セットアップ」を集約するか、**docs/SETUP.md** にまとめる。

### 2.3 デプロイ・運用系

| 現状                         | 内容                                     | マージ先案                                                |
| ---------------------------- | ---------------------------------------- | --------------------------------------------------------- |
| `DEPLOYMENT.md`              | 本番デプロイ手順・トラブルシューティング | メインのまま維持                                          |
| `PM2_TROUBLESHOOTING.md`     | PM2 のトラブルシューティング             | **docs/DEPLOYMENT.md** の「トラブルシューティング」に統合 |
| `DEPLOY_CHECKLIST.md`        | 管理者デプロイチェックリスト             | 上に「管理者デプロイ時のチェックリスト」として統合        |
| `DEPLOY_LABOR_CONDITIONS.md` | 労働条件通知書デプロイ手順               | 上に「機能別デプロイ」の例として統合                      |

→ **docs/DEPLOYMENT.md** を唯一のデプロイドキュメントにし、PM2・チェックリスト・労働条件デプロイを節として含める。

### 2.4 テストアカウント・シード系

| 現状                         | 内容                                     | マージ先案                                             |
| ---------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| `TEST_ACCOUNTS.md`           | テストアカウント一覧                     | **docs/SEED_DATA.md** に「テストアカウント一覧」を統合 |
| `docs/CHECK_ACCOUNTS.md`     | 上に「アカウント確認方法」として統合     |
| `docs/SEED_DATA.md`          | 上を拡張して1本化                        |
| `docs/ADD_DUMMY_ACCOUNTS.md` | 上に「ダミーアカウント追加」節として統合 |

→ **docs/SEED_AND_TEST_ACCOUNTS.md**（または **docs/SEED_DATA.md** を拡張）にまとめる。

---

## 3. 残すべき・参照頻度の高いファイル（現状のまま推奨）

- `README.md` - プロジェクト概要・セットアップ
- `docs/README.md` - ドキュメント一覧
- `docs/DEPLOYMENT.md` - デプロイ手順（統合先）
- `docs/SUBDOMAIN_YAKKYOKU_LP.md` - サブドメインLP
- `docs/PHARMACY_PAYMENT_REPORT_FLOW.md` - 支払い報告フロー
- `docs/PHARMACIST_APPLICATION_FLOW.md` - 応募画面フロー
- `docs/ADMIN_SYSTEM_REQUIREMENTS.md` - 管理者機能要件
- `docs/ADMIN_PANEL_DESIGN.md` - 管理者パネル設計
- `docs/PDF_DOWNLOAD.md` - PDFダウンロード
- `docs/GUIDE_SCREENSHOT_FILENAMES.md` - ガイド用画像一覧
- `docs/CLIENT_TEST_GUIDE.md` - クライアント向けテストガイド
- `docs/DOMAIN_SSL.md` - ドメイン・SSL
- `pharmacist_system_design.md` - 薬剤師側設計
- `pharmacy_system_design.md` - 薬局側設計
- `PAYMENT_CONFIRMATION_GUIDE.md` - 支払い承認スクリプト（運用で参照）
- `backend/ENV_SETUP.md` - バックエンド環境変数
- `IMPLEMENTATION_PLAN.md` - 実装計画（参照用として残す価値あり）
- 設計系: `database_design.md`, `api_design.md`, `system_flow_and_data.md`, `email_authentication_design.md`, `email_templates.md`, `admin_system_design.md`, `user_journey_scenarios.md`
- 規約等: `薬ナビ全体の利用規約.md`

---

## 4. 実行オーダー案

1. **archive 作成**  
   `docs/archive/` を作成し、上記「削除 」のうち履歴として残したいものを移動。

2. **マージ実施**
   - 管理者系 → `docs/ADMIN.md` に統合し、元ファイルは削除 or 冒頭で「docs/ADMIN.md に統合済み」と記載。
   - デプロイ系 → `docs/DEPLOYMENT.md` に PM2・チェックリスト・労働条件デプロイを統合。
   - テストアカウント・シード → `docs/SEED_DATA.md` 拡張 or `docs/SEED_AND_TEST_ACCOUNTS.md` に統合。
   - 起動・セットアップ → README または `docs/SETUP.md` に統合。

3. **削除**  
   明らかに不要な一時メモ・重複サマリーは削除。

4. **docs/README.md 更新**  
   統合・削除・archive に合わせて一覧を更新。

この内容で削除・移動・マージを実行してよいか、優先してやりたい項目があれば指定してください。
