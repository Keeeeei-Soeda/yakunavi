# 支払い報告時の運営メール送信（見通し）

薬局が「報告する」送信を完了したタイミングで、**info@yaku-navi.com** にメールを送る機能の見通しです。Resend を使用します。

---

## 実現可否

**できます。** 既存の Resend 設定（`RESEND_API_KEY`）と NotificationService のメール送信パターンを流用すれば、追加実装のみで対応可能です。

---

## 前提（既存）

| 項目 | 内容 |
|------|------|
| Resend | `backend` で `resend` パッケージを利用済み |
| APIキー | `process.env.RESEND_API_KEY` で読み込み（未設定時は送信スキップ） |
| 送信元 | `FROM_EMAIL` / `FROM_NAME`（未設定時は `noreply@yaku-navi.com` / 薬ナビ） |
| 他例 | `NotificationService`（薬剤師向け通知）、`ContactService`（お問い合わせ→管理者送信） |

---

## やること（方針）

1. **送信先**  
   - 固定で **info@yaku-navi.com** に送る。  
   - 必要なら後から `ADMIN_EMAILS` や環境変数で変更可能にする。

2. **送信タイミング**  
   - `PaymentService.reportPayment()` 内で、DB を `reported` に更新した**直後**にメール送信を呼ぶ。  
   - 送信失敗しても報告処理は成功扱いにする（`.catch()` でログのみ）。

3. **実装場所**  
   - **NotificationService** に `notifyPaymentReportedToAdmin(params)` を追加。  
   - 既存の `sendEmail` と同様に Resend で送信。  
   - **PaymentService** の `reportPayment` で、契約・薬局情報を取得してからこのメソッドを呼ぶ。

4. **メール内容（案）**  
   - 件名: 「【薬ナビ】支払い報告がありました（薬局名 / 請求書ID）」  
   - 本文:  
     - 支払い報告があった旨の短文  
     - 入金日（支払い日）  
     - 振込名義（法人名等）  
     - 確認用メモ（任意・あれば）  
     - 請求書ID・契約ID・薬局名  
   - 管理画面の該当支払い詳細へのリンク（入金確認の導線）

5. **環境変数**  
   - 既存の `RESEND_API_KEY` のみで送信可能。  
   - 送信先を変えたい場合のみ、例: `PAYMENT_REPORT_NOTIFY_EMAIL=info@yaku-navi.com` などを追加。

---

## 変更・追加ファイル（想定）

| ファイル | 変更内容 |
|----------|----------|
| `backend/src/services/notification.service.ts` | `notifyPaymentReportedToAdmin()` を追加。送信先 `info@yaku-navi.com`、件名・本文を組み立てて `sendEmail()` で送信。 |
| `backend/src/services/payment.service.ts` | `reportPayment` 内で、更新後に契約・薬局を include した情報で `notifyPaymentReportedToAdmin()` を呼ぶ。失敗時はログのみ（報告は成功のまま）。 |
| （任意）`docs/PHARMACY_PAYMENT_REPORT_FLOW.md` | 報告完了時に info@ にメールが送られる旨を追記。 |

---

## Resend 設定（本番）

- ドメイン認証済みであれば、送信元は既存の `FROM_EMAIL` のままでよい。  
- 送信先 **info@yaku-navi.com** は Resend 側の特別設定は不要（通常の宛先として送信可能）。  
- 本番サーバーの `.env` に `RESEND_API_KEY` が入っていれば、そのまま利用可能。

---

## テスト

- 薬局で支払い報告を実行 → DB が `reported` に更新され、info@yaku-navi.com にメールが届くこと。  
- `RESEND_API_KEY` を外した場合、報告は成功し、メールだけ送信されない（既存のスキップ挙動と同じ）。

以上で、報告完了時に info@ へ Resend でメールを送ることは問題なく実現できます。
