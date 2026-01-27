# 薬局管理システム：メールテンプレート集

## 目次

### 共通メール
1. メールアドレス確認（登録時）
2. パスワードリセット要求
3. パスワードリセット完了

### 薬局向けメール
4. 薬局アカウント作成完了
5. 求人公開完了
6. 新規応募通知
7. メッセージ受信通知
8. 薬剤師が初回出勤日を選択
9. オファー承認通知（契約成立）
10. 請求書発行通知
11. 支払い期限リマインダー（3日前）
12. 支払い期限リマインダー（1日前）
13. 支払い確認完了通知
14. 契約キャンセル通知（未払い）
15. ペナルティ適用通知

### 薬剤師向けメール
16. 薬剤師アカウント作成完了
17. 資格証明書承認通知
18. 資格証明書差し戻し通知
19. 薬局からメッセージ受信
20. 初回出勤日候補受信
21. 正式オファー受信
22. 契約成立通知
23. 支払い確認完了通知（連絡先開示）

---

## 共通メール

### 1. メールアドレス確認（登録時）

**件名:** 【薬局管理システム】メールアドレスの確認

**HTML版:**
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>メールアドレスの確認</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      line-height: 1.8;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 40px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .button:hover {
      opacity: 0.9;
    }
    .url-box {
      background-color: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 15px;
      word-break: break-all;
      font-size: 14px;
      color: #666;
      margin: 20px 0;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning-icon {
      color: #ff9800;
      font-weight: bold;
      margin-right: 5px;
    }
    .note {
      color: #666;
      font-size: 14px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #e0e0e0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 薬局管理システム</h1>
    </div>
    
    <div class="content">
      <div class="greeting">
        <strong>{{user_name}}</strong> 様
      </div>
      
      <p>薬局管理システムにご登録いただきありがとうございます。</p>
      
      <p>以下のボタンをクリックして、メールアドレスを確認してください。</p>
      
      <div class="button-container">
        <a href="{{verification_url}}" class="button">
          メールアドレスを確認する
        </a>
      </div>
      
      <p>ボタンが機能しない場合は、以下のURLをブラウザにコピー＆ペーストしてください：</p>
      
      <div class="url-box">
        {{verification_url}}
      </div>
      
      <div class="warning">
        <span class="warning-icon">⚠️</span>
        <strong>このリンクは24時間有効です。</strong>
      </div>
      
      <div class="note">
        このメールに心当たりがない場合は、このメールを無視してください。<br>
        メールアドレスの確認を行わない限り、アカウントは有効になりません。
      </div>
    </div>
    
    <div class="footer">
      <p>このメールは自動送信されています。返信しないでください。</p>
      <p>お問い合わせ: <a href="mailto:support@example.com">support@example.com</a></p>
      <p>&copy; 2026 薬局管理システム</p>
    </div>
  </div>
</body>
</html>
```

**テキスト版:**
```
【薬局管理システム】メールアドレスの確認

{{user_name}} 様

薬局管理システムにご登録いただきありがとうございます。

以下のリンクをクリックして、メールアドレスを確認してください。

{{verification_url}}

⚠️ このリンクは24時間有効です。

このメールに心当たりがない場合は、このメールを無視してください。
メールアドレスの確認を行わない限り、アカウントは有効になりません。

---
このメールは自動送信されています。返信しないでください。
お問い合わせ: support@example.com

薬局管理システム
```

---

### 2. パスワードリセット要求

**件名:** 【薬局管理システム】パスワードリセットのご案内

**HTML版:**
```html
<!-- 基本構造は同じ、内容のみ記載 -->
<div class="content">
  <div class="greeting">
    <strong>{{user_name}}</strong> 様
  </div>
  
  <p>パスワードリセットのリクエストを受け付けました。</p>
  
  <p>以下のボタンをクリックして、新しいパスワードを設定してください。</p>
  
  <div class="button-container">
    <a href="{{reset_url}}" class="button">
      パスワードをリセットする
    </a>
  </div>
  
  <p>ボタンが機能しない場合は、以下のURLをブラウザにコピー＆ペーストしてください：</p>
  
  <div class="url-box">
    {{reset_url}}
  </div>
  
  <div class="warning">
    <span class="warning-icon">⚠️</span>
    <strong>このリンクは1時間有効です。</strong>
  </div>
  
  <div class="note">
    このリクエストに心当たりがない場合は、このメールを無視してください。<br>
    第三者がアクセスしようとしている可能性があります。念のためパスワードを変更することをお勧めします。
  </div>
</div>
```

**テキスト版:**
```
【薬局管理システム】パスワードリセットのご案内

{{user_name}} 様

パスワードリセットのリクエストを受け付けました。

以下のリンクをクリックして、新しいパスワードを設定してください。

{{reset_url}}

⚠️ このリンクは1時間有効です。

このリクエストに心当たりがない場合は、このメールを無視してください。
第三者がアクセスしようとしている可能性があります。

---
薬局管理システム
```

---

## 薬局向けメール

### 4. 薬局アカウント作成完了

**件名:** 【薬局管理システム】アカウント作成完了

**HTML版:**
```html
<div class="content">
  <div class="greeting">
    <strong>{{pharmacy_name}}</strong> 様
  </div>
  
  <p>薬局アカウントの作成が完了しました。</p>
  
  <div style="background-color: #e8f5e9; padding: 20px; border-radius: 6px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #2e7d32;">✅ 次のステップ</h3>
    <ol style="margin-bottom: 0; padding-left: 20px;">
      <li><strong>プロフィールを充実させる</strong><br>
          薬局情報を詳しく記載すると、応募が集まりやすくなります。</li>
      <li><strong>求人を投稿する</strong><br>
          条件を入力して、薬剤師を募集しましょう。</li>
    </ol>
  </div>
  
  <div class="button-container">
    <a href="{{dashboard_url}}" class="button">
      ダッシュボードを開く
    </a>
  </div>
  
  <div class="note">
    <h4>ご利用料金について</h4>
    <p>・求人投稿は無料です<br>
    ・契約成立時に報酬総額の40%をプラットフォーム手数料としていただきます<br>
    ・手数料は初回出勤日の3日前までにお支払いください</p>
  </div>
</div>
```

**テキスト版:**
```
【薬局管理システム】アカウント作成完了

{{pharmacy_name}} 様

薬局アカウントの作成が完了しました。

✅ 次のステップ

1. プロフィールを充実させる
   薬局情報を詳しく記載すると、応募が集まりやすくなります。

2. 求人を投稿する
   条件を入力して、薬剤師を募集しましょう。

ダッシュボード: {{dashboard_url}}

【ご利用料金について】
・求人投稿は無料です
・契約成立時に報酬総額の40%をプラットフォーム手数料としていただきます
・手数料は初回出勤日の3日前までにお支払いください

---
薬局管理システム
```

---

### 5. 求人公開完了

**件名:** 【薬局管理システム】求人を公開しました

**HTML版:**
```html
<div class="content">
  <div class="greeting">
    <strong>{{pharmacy_name}}</strong> 様
  </div>
  
  <p>求人「<strong>{{job_title}}</strong>」を公開しました。</p>
  
  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
    <h3 style="margin-top: 0;">📋 求人情報</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666;">勤務地</td>
        <td style="padding: 8px 0;"><strong>{{work_location}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">日給</td>
        <td style="padding: 8px 0;"><strong>{{daily_wage}}円</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">勤務日数</td>
        <td style="padding: 8px 0;"><strong>{{work_days}}日</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">募集期限</td>
        <td style="padding: 8px 0;"><strong>{{deadline}}</strong></td>
      </tr>
    </table>
  </div>
  
  <p>応募があった場合、メールとシステムで通知いたします。</p>
  
  <div class="button-container">
    <a href="{{job_url}}" class="button">
      求人詳細を見る
    </a>
  </div>
</div>
```

**テキスト版:**
```
【薬局管理システム】求人を公開しました

{{pharmacy_name}} 様

求人「{{job_title}}」を公開しました。

【求人情報】
・勤務地: {{work_location}}
・日給: {{daily_wage}}円
・勤務日数: {{work_days}}日
・募集期限: {{deadline}}

応募があった場合、メールとシステムで通知いたします。

求人詳細: {{job_url}}

---
薬局管理システム
```

---

### 6. 新規応募通知

**件名:** 【薬局管理システム】新しい応募がありました

**HTML版:**
```html
<div class="content">
  <div class="greeting">
    <strong>{{pharmacy_name}}</strong> 様
  </div>
  
  <p>求人「<strong>{{job_title}}</strong>」に新しい応募がありました。</p>
  
  <div style="background-color: #e3f2fd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2196f3;">
    <h3 style="margin-top: 0; color: #1976d2;">👤 応募者情報</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666;">応募者</td>
        <td style="padding: 8px 0;"><strong>応募者{{applicant_code}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">年齢</td>
        <td style="padding: 8px 0;"><strong>{{age}}歳</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">経験年数</td>
        <td style="padding: 8px 0;"><strong>{{experience_years}}年{{experience_months}}ヶ月</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">最寄駅</td>
        <td style="padding: 8px 0;"><strong>{{nearest_station}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">応募日時</td>
        <td style="padding: 8px 0;"><strong>{{applied_at}}</strong></td>
      </tr>
    </table>
  </div>
  
  <div class="warning" style="background-color: #fff9e6;">
    <span class="warning-icon">💡</span>
    詳細なプロフィールと自己紹介文はシステムでご確認ください。
  </div>
  
  <div class="button-container">
    <a href="{{application_url}}" class="button">
      応募者のプロフィールを見る
    </a>
  </div>
</div>
```

**テキスト版:**
```
【薬局管理システム】新しい応募がありました

{{pharmacy_name}} 様

求人「{{job_title}}」に新しい応募がありました。

【応募者情報】
・応募者: 応募者{{applicant_code}}
・年齢: {{age}}歳
・経験年数: {{experience_years}}年{{experience_months}}ヶ月
・最寄駅: {{nearest_station}}
・応募日時: {{applied_at}}

💡 詳細なプロフィールと自己紹介文はシステムでご確認ください。

応募詳細: {{application_url}}

---
薬局管理システム
```

---

### 8. 薬剤師が初回出勤日を選択

**件名:** 【薬局管理システム】薬剤師が初回出勤日を選択しました

**HTML版:**
```html
<div class="content">
  <div class="greeting">
    <strong>{{pharmacy_name}}</strong> 様
  </div>
  
  <p>応募者{{applicant_code}}が初回出勤日を選択しました。</p>
  
  <div style="background-color: #e8f5e9; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
    <div style="font-size: 14px; color: #666; margin-bottom: 5px;">選択された初回出勤日</div>
    <div style="font-size: 28px; font-weight: bold; color: #2e7d32;">
      {{selected_date}}
    </div>
  </div>
  
  <p>次のステップとして、正式なオファーを送信してください。</p>
  
  <div class="button-container">
    <a href="{{send_offer_url}}" class="button">
      正式オファーを送信する
    </a>
  </div>
  
  <div class="note">
    <strong>正式オファー送信後の流れ:</strong><br>
    1. 薬剤師がオファーを承認すると契約が成立します<br>
    2. 契約成立後、請求書が自動発行されます<br>
    3. 手数料をお支払いいただくと、薬剤師の連絡先が開示されます
  </div>
</div>
```

**テキスト版:**
```
【薬局管理システム】薬剤師が初回出勤日を選択しました

{{pharmacy_name}} 様

応募者{{applicant_code}}が初回出勤日を選択しました。

【選択された初回出勤日】
{{selected_date}}

次のステップとして、正式なオファーを送信してください。

正式オファー送信: {{send_offer_url}}

【正式オファー送信後の流れ】
1. 薬剤師がオファーを承認すると契約が成立します
2. 契約成立後、請求書が自動発行されます
3. 手数料をお支払いいただくと、薬剤師の連絡先が開示されます

---
薬局管理システム
```

---

### 9. オファー承認通知（契約成立）

**件名:** 【薬局管理システム】🎉 オファーが承認されました - 契約成立

**HTML版:**
```html
<div class="content">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
    <h2 style="color: #2e7d32; margin: 0;">おめでとうございます！</h2>
  </div>
  
  <div class="greeting">
    <strong>{{pharmacy_name}}</strong> 様
  </div>
  
  <p>応募者{{applicant_code}}がオファーを承認しました。<br>
  <strong style="color: #2e7d32;">契約が成立しました！</strong></p>
  
  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
    <h3 style="margin-top: 0;">📋 契約内容</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666;">契約ID</td>
        <td style="padding: 8px 0;"><strong>{{contract_id}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">初回出勤日</td>
        <td style="padding: 8px 0;"><strong>{{initial_work_date}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">勤務日数</td>
        <td style="padding: 8px 0;"><strong>{{work_days}}日</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">日給</td>
        <td style="padding: 8px 0;"><strong>{{daily_wage}}円</strong></td>
      </tr>
      <tr style="border-top: 2px solid #ddd;">
        <td style="padding: 8px 0; color: #666;">報酬総額</td>
        <td style="padding: 8px 0;"><strong style="font-size: 18px; color: #2e7d32;">{{total_compensation}}円</strong></td>
      </tr>
    </table>
  </div>
  
  <div style="background-color: #fff3cd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff9800;">
    <h3 style="margin-top: 0; color: #f57c00;">💳 お支払いについて（重要）</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666;">プラットフォーム手数料</td>
        <td style="padding: 8px 0;"><strong style="font-size: 18px;">{{platform_fee}}円</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">お支払い期限</td>
        <td style="padding: 8px 0;"><strong style="font-size: 18px; color: #d32f2f;">{{payment_deadline}}</strong></td>
      </tr>
    </table>
    <p style="margin-bottom: 0; margin-top: 15px;">
      <strong>⚠️ 期限までにお支払いがない場合、契約は自動キャンセルされます</strong>
    </p>
  </div>
  
  <div class="button-container">
    <a href="{{invoice_url}}" class="button">
      請求書を確認する
    </a>
  </div>
  
  <div class="note">
    <strong>次のステップ:</strong><br>
    1. 請求書を確認してください<br>
    2. {{payment_deadline}}までに手数料をお支払いください<br>
    3. お支払い後、必ずシステムから「支払い完了報告」を行ってください<br>
    4. 運営が支払いを確認後、薬剤師の連絡先が開示されます<br>
    5. 薬剤師と直接連絡を取り、詳細なスケジュールを調整してください
  </div>
</div>
```

**テキスト版:**
```
【薬局管理システム】🎉 オファーが承認されました - 契約成立

{{pharmacy_name}} 様

おめでとうございます！

応募者{{applicant_code}}がオファーを承認しました。
契約が成立しました！

【契約内容】
・契約ID: {{contract_id}}
・初回出勤日: {{initial_work_date}}
・勤務日数: {{work_days}}日
・日給: {{daily_wage}}円
・報酬総額: {{total_compensation}}円

【お支払いについて（重要）】
・プラットフォーム手数料: {{platform_fee}}円
・お支払い期限: {{payment_deadline}}

⚠️ 期限までにお支払いがない場合、契約は自動キャンセルされます

請求書: {{invoice_url}}

【次のステップ】
1. 請求書を確認してください
2. {{payment_deadline}}までに手数料をお支払いください
3. お支払い後、必ずシステムから「支払い完了報告」を行ってください
4. 運営が支払いを確認後、薬剤師の連絡先が開示されます
5. 薬剤師と直接連絡を取り、詳細なスケジュールを調整してください

---
薬局管理システム
```

---

### 11. 支払い期限リマインダー（3日前）

**件名:** 【薬局管理システム】⚠️ 手数料の支払い期限が近づいています（あと3日）

**HTML版:**
```html
<div class="content">
  <div class="greeting">
    <strong>{{pharmacy_name}}</strong> 様
  </div>
  
  <div style="background-color: #fff3cd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff9800;">
    <h3 style="margin-top: 0; color: #f57c00;">⚠️ 支払い期限リマインダー</h3>
    <p style="font-size: 16px; margin-bottom: 0;">
      契約ID <strong>{{contract_id}}</strong> の手数料支払い期限が<strong style="color: #d32f2f;">あと3日</strong>に迫っています。
    </p>
  </div>
  
  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
    <h3 style="margin-top: 0;">💳 お支払い情報</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666;">契約ID</td>
        <td style="padding: 8px 0;"><strong>{{contract_id}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">薬剤師</td>
        <td style="padding: 8px 0;"><strong>応募者{{applicant_code}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">初回出勤日</td>
        <td style="padding: 8px 0;"><strong>{{initial_work_date}}</strong></td>
      </tr>
      <tr style="border-top: 2px solid #ddd;">
        <td style="padding: 8px 0; color: #666;">お支払い金額</td>
        <td style="padding: 8px 0;"><strong style="font-size: 18px;">{{platform_fee}}円</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">お支払い期限</td>
        <td style="padding: 8px 0;"><strong style="font-size: 18px; color: #d32f2f;">{{payment_deadline}}</strong></td>
      </tr>
    </table>
  </div>
  
  <div style="background-color: #ffebee; padding: 15px; border-radius: 6px; margin: 20px 0;">
    <strong style="color: #c62828;">⚠️ 期限までにお支払いがない場合:</strong><br>
    ・契約は自動的にキャンセルされます<br>
    ・薬剤師への連絡先開示は行われません<br>
    ・アカウントに対してペナルティが適用されます
  </div>
  
  <div class="button-container">
    <a href="{{payment_url}}" class="button">
      お支払い手続きへ
    </a>
  </div>
</div>
```

**テキスト版:**
```
【薬局管理システム】⚠️ 手数料の支払い期限が近づいています（あと3日）

{{pharmacy_name}} 様

契約ID {{contract_id}} の手数料支払い期限があと3日に迫っています。

【お支払い情報】
・契約ID: {{contract_id}}
・薬剤師: 応募者{{applicant_code}}
・初回出勤日: {{initial_work_date}}
・お支払い金額: {{platform_fee}}円
・お支払い期限: {{payment_deadline}}

⚠️ 期限までにお支払いがない場合:
・契約は自動的にキャンセルされます
・薬剤師への連絡先開示は行われません
・アカウントに対してペナルティが適用されます

お支払い手続き: {{payment_url}}

---
薬局管理システム
```

---

### 13. 支払い確認完了通知

**件名:** 【薬局管理システム】✅ 支払いを確認しました - 薬剤師の連絡先を開示します

**HTML版:**
```html
<div class="content">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
    <h2 style="color: #2e7d32; margin: 0;">支払い確認完了</h2>
  </div>
  
  <div class="greeting">
    <strong>{{pharmacy_name}}</strong> 様
  </div>
  
  <p>手数料のお支払いを確認いたしました。<br>
  ありがとうございます。</p>
  
  <div style="background-color: #e3f2fd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2196f3;">
    <h3 style="margin-top: 0; color: #1976d2;">👤 薬剤師の連絡先</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666;">氏名</td>
        <td style="padding: 8px 0;"><strong>{{pharmacist_name}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">電話番号</td>
        <td style="padding: 8px 0;"><strong>{{pharmacist_phone}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">メールアドレス</td>
        <td style="padding: 8px 0;"><strong>{{pharmacist_email}}</strong></td>
      </tr>
    </table>
  </div>
  
  <div style="background-color: #e8f5e9; padding: 20px; border-radius: 6px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #2e7d32;">📅 次のステップ</h3>
    <ol style="margin-bottom: 0; padding-left: 20px;">
      <li><strong>薬剤師に直接連絡を取る</strong><br>
          電話またはメールで連絡してください。</li>
      <li><strong>詳細なスケジュールを調整する</strong><br>
          勤務曜日、勤務時間、持ち物などを打ち合わせてください。</li>
      <li><strong>初回出勤日の準備</strong><br>
          {{initial_work_date}} に向けて準備を進めてください。</li>
    </ol>
  </div>
  
  <div class="button-container">
    <a href="{{contract_url}}" class="button">
      契約詳細を見る
    </a>
  </div>
  
  <div class="note">
    <strong>報酬のお支払いについて:</strong><br>
    薬剤師への報酬（{{total_compensation}}円）は、体験期間終了後に直接お支払いください。<br>
    プラットフォームを介した支払いは不要です。
  </div>
</div>
```

**テキスト版:**
```
【薬局管理システム】✅ 支払いを確認しました - 薬剤師の連絡先を開示します

{{pharmacy_name}} 様

手数料のお支払いを確認いたしました。
ありがとうございます。

【薬剤師の連絡先】
・氏名: {{pharmacist_name}}
・電話番号: {{pharmacist_phone}}
・メールアドレス: {{pharmacist_email}}

【次のステップ】
1. 薬剤師に直接連絡を取る
   電話またはメールで連絡してください。

2. 詳細なスケジュールを調整する
   勤務曜日、勤務時間、持ち物などを打ち合わせてください。

3. 初回出勤日の準備
   {{initial_work_date}} に向けて準備を進めてください。

契約詳細: {{contract_url}}

【報酬のお支払いについて】
薬剤師への報酬（{{total_compensation}}円）は、体験期間終了後に直接お支払いください。
プラットフォームを介した支払いは不要です。

---
薬局管理システム
```

---

### 14. 契約キャンセル通知（未払い）

**件名:** 【薬局管理システム】🚨 契約がキャンセルされました（手数料未払い）

**HTML版:**
```html
<div class="content">
  <div style="background-color: #ffebee; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #c62828;">
    <h2 style="margin-top: 0; color: #c62828;">🚨 契約キャンセル通知</h2>
  </div>
  
  <div class="greeting">
    <strong>{{pharmacy_name}}</strong> 様
  </div>
  
  <p>契約ID <strong>{{contract_id}}</strong> は、手数料の支払い期限を過ぎたため、<br>
  <strong style="color: #c62828;">自動的にキャンセルされました。</strong></p>
  
  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
    <h3 style="margin-top: 0;">📋 キャンセルされた契約</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666;">契約ID</td>
        <td style="padding: 8px 0;"><strong>{{contract_id}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">薬剤師</td>
        <td style="padding: 8px 0;"><strong>応募者{{applicant_code}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">初回出勤予定日</td>
        <td style="padding: 8px 0;"><strong>{{initial_work_date}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">未払い金額</td>
        <td style="padding: 8px 0;"><strong style="color: #c62828;">{{platform_fee}}円</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">支払い期限</td>
        <td style="padding: 8px 0;"><strong>{{payment_deadline}}（超過）</strong></td>
      </tr>
    </table>
  </div>
  
  <div style="background-color: #fff3cd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff9800;">
    <h3 style="margin-top: 0; color: #f57c00;">⚠️ ペナルティについて</h3>
    <p><strong>1回目の未払い:</strong> アカウントが一時停止されました</p>
    <ul style="margin-bottom: 0;">
      <li>新規求人の投稿ができません</li>
      <li>既存の求人は一時停止されました</li>
    </ul>
  </div>
  
  <div style="background-color: #e8f5e9; padding: 20px; border-radius: 6px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #2e7d32;">💡 アカウント復旧方法</h3>
    <ol style="margin-bottom: 0; padding-left: 20px;">
      <li>未払いの手数料（{{platform_fee}}円）をお支払いください</li>
      <li>システムから「ペナルティ解除申請」を行ってください</li>
      <li>運営が支払いを確認後、アカウントを復旧いたします</li>
    </ol>
  </div>
  
  <div class="button-container">
    <a href="{{dashboard_url}}" class="button">
      ダッシュボードを開く
    </a>
  </div>
  
  <div class="note">
    <strong>⚠️ 重要な注意事項:</strong><br>
    2回目の未払いが発生した場合、アカウントは永久停止となります。<br>
    今後は期限内のお支払いをお願いいたします。
  </div>
</div>
```

**テキスト版:**
```
【薬局管理システム】🚨 契約がキャンセルされました（手数料未払い）

{{pharmacy_name}} 様

契約ID {{contract_id}} は、手数料の支払い期限を過ぎたため、
自動的にキャンセルされました。

【キャンセルされた契約】
・契約ID: {{contract_id}}
・薬剤師: 応募者{{applicant_code}}
・初回出勤予定日: {{initial_work_date}}
・未払い金額: {{platform_fee}}円
・支払い期限: {{payment_deadline}}（超過）

【ペナルティについて】
1回目の未払い: アカウントが一時停止されました
・新規求人の投稿ができません
・既存の求人は一時停止されました

【アカウント復旧方法】
1. 未払いの手数料（{{platform_fee}}円）をお支払いください
2. システムから「ペナルティ解除申請」を行ってください
3. 運営が支払いを確認後、アカウントを復旧いたします

⚠️ 重要: 2回目の未払いが発生した場合、アカウントは永久停止となります。

ダッシュボード: {{dashboard_url}}

---
薬局管理システム
```

---

## 薬剤師向けメール

### 17. 資格証明書承認通知

**件名:** 【薬局管理システム】✅ 資格証明書が承認されました

**HTML版:**
```html
<div class="content">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
    <h2 style="color: #2e7d32; margin: 0;">資格証明書承認完了</h2>
  </div>
  
  <div class="greeting">
    <strong>{{pharmacist_name}}</strong> 様
  </div>
  
  <p>資格証明書の確認が完了しました。</p>
  
  <div style="background-color: #e8f5e9; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
    <div style="font-size: 18px; font-weight: bold; color: #2e7d32; margin-bottom: 10px;">
      ✅ 本人確認完了
    </div>
    <p style="margin: 0; color: #666;">
      求人への応募が可能になりました
    </p>
  </div>
  
  <div style="background-color: #e3f2fd; padding: 20px; border-radius: 6px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1976d2;">📋 次のステップ</h3>
    <ol style="margin-bottom: 0; padding-left: 20px;">
      <li><strong>プロフィールを充実させる</strong><br>
          経験や得意分野を詳しく書くと、良い求人が見つかりやすくなります。</li>
      <li><strong>求人を探す</strong><br>
          条件に合った求人を検索して応募しましょう。</li>
    </ol>
  </div>
  
  <div class="button-container">
    <a href="{{job_search_url}}" class="button">
      求人を探す
    </a>
  </div>
</div>
```

**テキスト版:**
```
【薬局管理システム】✅ 資格証明書が承認されました

{{pharmacist_name}} 様

資格証明書の確認が完了しました。

✅ 本人確認完了
求人への応募が可能になりました

【次のステップ】
1. プロフィールを充実させる
   経験や得意分野を詳しく書くと、良い求人が見つかりやすくなります。

2. 求人を探す
   条件に合った求人を検索して応募しましょう。

求人検索: {{job_search_url}}

---
薬局管理システム
```

---

### 18. 資格証明書差し戻し通知

**件名:** 【薬局管理システム】資格証明書の再提出をお願いします

**HTML版:**
```html
<div class="content">
  <div class="greeting">
    <strong>{{pharmacist_name}}</strong> 様
  </div>
  
  <p>資格証明書を確認いたしましたが、以下の理由により再提出をお願いいたします。</p>
  
  <div style="background-color: #fff3cd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff9800;">
    <h3 style="margin-top: 0; color: #f57c00;">📝 差し戻し理由</h3>
    <p style="white-space: pre-wrap; margin-bottom: 0;">{{rejection_reason}}</p>
  </div>
  
  <div style="background-color: #e3f2fd; padding: 20px; border-radius: 6px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1976d2;">💡 再提出の手順</h3>
    <ol style="margin-bottom: 0; padding-left: 20px;">
      <li>差し戻し理由を確認する</li>
      <li>鮮明な画像・PDFを準備する</li>
      <li>システムから再度アップロードする</li>
    </ol>
  </div>
  
  <div class="button-container">
    <a href="{{upload_url}}" class="button">
      証明書を再アップロードする
    </a>
  </div>
  
  <div class="note">
    不明な点がございましたら、お気軽にお問い合わせください。<br>
    サポート: support@example.com
  </div>
</div>
```

**テキスト版:**
```
【薬局管理システム】資格証明書の再提出をお願いします

{{pharmacist_name}} 様

資格証明書を確認いたしましたが、以下の理由により再提出をお願いいたします。

【差し戻し理由】
{{rejection_reason}}

【再提出の手順】
1. 差し戻し理由を確認する
2. 鮮明な画像・PDFを準備する
3. システムから再度アップロードする

証明書アップロード: {{upload_url}}

不明な点がございましたら、お気軽にお問い合わせください。
サポート: support@example.com

---
薬局管理システム
```

---

### 20. 初回出勤日候補受信

**件名:** 【薬局管理システム】薬局から初回出勤日の候補が届きました

**HTML版:**
```html
<div class="content">
  <div class="greeting">
    <strong>{{pharmacist_name}}</strong> 様
  </div>
  
  <p><strong>{{pharmacy_name}}</strong> から初回出勤日の候補が届きました。</p>
  
  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
    <h3 style="margin-top: 0;">📅 候補日</h3>
    <div style="font-size: 16px; line-height: 2;">
      {{#each candidate_dates}}
      <div style="padding: 10px; background-color: white; border-radius: 4px; margin-bottom: 10px;">
        ◯ <strong>{{this}}</strong>
      </div>
      {{/each}}
    </div>
  </div>
  
  <p>この中から1つの日を選択してください。</p>
  
  <div class="button-container">
    <a href="{{select_date_url}}" class="button">
      初回出勤日を選択する
    </a>
  </div>
  
  <div class="note">
    <strong>選択後の流れ:</strong><br>
    1. 薬局から正式オファーが届きます<br>
    2. オファー内容を確認して承認すると契約成立<br>
    3. 薬局が手数料を支払うと連絡先が開示されます<br>
    4. 薬局と直接連絡を取り、詳細を調整します
  </div>
</div>
```

**テキスト版:**
```
【薬局管理システム】薬局から初回出勤日の候補が届きました

{{pharmacist_name}} 様

{{pharmacy_name}} から初回出勤日の候補が届きました。

【候補日】
{{candidate_dates}}

この中から1つの日を選択してください。

初回出勤日選択: {{select_date_url}}

【選択後の流れ】
1. 薬局から正式オファーが届きます
2. オファー内容を確認して承認すると契約成立
3. 薬局が手数料を支払うと連絡先が開示されます
4. 薬局と直接連絡を取り、詳細を調整します

---
薬局管理システム
```

---

### 21. 正式オファー受信

**件名:** 【薬局管理システム】正式オファーが届きました

**HTML版:**
```html
<div class="content">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="font-size: 48px; margin-bottom: 10px;">📩</div>
    <h2 style="color: #1976d2; margin: 0;">正式オファー受信</h2>
  </div>
  
  <div class="greeting">
    <strong>{{pharmacist_name}}</strong> 様
  </div>
  
  <p><strong>{{pharmacy_name}}</strong> から正式オファーが届きました。</p>
  
  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
    <h3 style="margin-top: 0;">📋 オファー内容</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666;">薬局名</td>
        <td style="padding: 8px 0;"><strong>{{pharmacy_name}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">初回出勤日</td>
        <td style="padding: 8px 0;"><strong>{{initial_work_date}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">勤務日数</td>
        <td style="padding: 8px 0;"><strong>{{work_days}}日</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">日給</td>
        <td style="padding: 8px 0;"><strong>{{daily_wage}}円</strong></td>
      </tr>
      <tr style="border-top: 2px solid #ddd;">
        <td style="padding: 8px 0; color: #666;">報酬総額</td>
        <td style="padding: 8px 0;"><strong style="font-size: 20px; color: #2e7d32;">{{total_compensation}}円</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">勤務時間（目安）</td>
        <td style="padding: 8px 0;"><strong>{{work_hours}}</strong></td>
      </tr>
    </table>
  </div>
  
  <div style="background-color: #fff3cd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff9800;">
    <h3 style="margin-top: 0; color: #f57c00;">⚠️ 重要事項</h3>
    <ul style="margin-bottom: 0;">
      <li>オファーを承認すると契約が成立します</li>
      <li>承認後のキャンセルはできません</li>
      <li>報酬は体験期間終了後に薬局から直接お支払いいただきます</li>
      <li>薬局が手数料を支払った後、連絡先が開示されます</li>
    </ul>
  </div>
  
  <div class="button-container">
    <a href="{{offer_url}}" class="button">
      オファー内容を確認する
    </a>
  </div>
</div>
```

**テキスト版:**
```
【薬局管理システム】正式オファーが届きました

{{pharmacist_name}} 様

{{pharmacy_name}} から正式オファーが届きました。

【オファー内容】
・薬局名: {{pharmacy_name}}
・初回出勤日: {{initial_work_date}}
・勤務日数: {{work_days}}日
・日給: {{daily_wage}}円
・報酬総額: {{total_compensation}}円
・勤務時間（目安）: {{work_hours}}

⚠️ 重要事項
・オファーを承認すると契約が成立します
・承認後のキャンセルはできません
・報酬は体験期間終了後に薬局から直接お支払いいただきます
・薬局が手数料を支払った後、連絡先が開示されます

オファー確認: {{offer_url}}

---
薬局管理システム
```

---

### 23. 支払い確認完了通知（連絡先開示）

**件名:** 【薬局管理システム】✅ 薬局の手数料支払いが確認されました

**HTML版:**
```html
<div class="content">
  <div class="greeting">
    <strong>{{pharmacist_name}}</strong> 様
  </div>
  
  <p><strong>{{pharmacy_name}}</strong> の手数料支払いが確認されました。</p>
  
  <div style="background-color: #e3f2fd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2196f3;">
    <h3 style="margin-top: 0; color: #1976d2;">🏥 薬局の連絡先</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666;">薬局名</td>
        <td style="padding: 8px 0;"><strong>{{pharmacy_name}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">住所</td>
        <td style="padding: 8px 0;"><strong>{{pharmacy_address}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">電話番号</td>
        <td style="padding: 8px 0;"><strong>{{pharmacy_phone}}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">担当者</td>
        <td style="padding: 8px 0;"><strong>{{contact_person}}</strong></td>
      </tr>
    </table>
  </div>
  
  <div style="background-color: #e8f5e9; padding: 20px; border-radius: 6px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #2e7d32;">📅 次のステップ</h3>
    <ol style="margin-bottom: 0; padding-left: 20px;">
      <li><strong>薬局からの連絡を待つ、または自分から連絡する</strong><br>
          詳細なスケジュールを調整します。</li>
      <li><strong>勤務の詳細を確認する</strong><br>
          勤務曜日、勤務時間、持ち物、服装などを確認してください。</li>
      <li><strong>初回出勤日の準備</strong><br>
          {{initial_work_date}} に向けて準備を進めてください。</li>
    </ol>
  </div>
  
  <div class="button-container">
    <a href="{{contract_url}}" class="button">
      契約詳細を見る
    </a>
  </div>
  
  <div class="note">
    <strong>報酬のお支払いについて:</strong><br>
    報酬（{{total_compensation}}円）は、体験期間終了後に薬局から直接お支払いいただきます。<br>
    実際の勤務日数に応じて計算されます。
  </div>
</div>
```

**テキスト版:**
```
【薬局管理システム】✅ 薬局の手数料支払いが確認されました

{{pharmacist_name}} 様

{{pharmacy_name}} の手数料支払いが確認されました。

【薬局の連絡先】
・薬局名: {{pharmacy_name}}
・住所: {{pharmacy_address}}
・電話番号: {{pharmacy_phone}}
・担当者: {{contact_person}}

【次のステップ】
1. 薬局からの連絡を待つ、または自分から連絡する
   詳細なスケジュールを調整します。

2. 勤務の詳細を確認する
   勤務曜日、勤務時間、持ち物、服装などを確認してください。

3. 初回出勤日の準備
   {{initial_work_date}} に向けて準備を進めてください。

契約詳細: {{contract_url}}

【報酬のお支払いについて】
報酬（{{total_compensation}}円）は、体験期間終了後に薬局から直接お支払いいただきます。
実際の勤務日数に応じて計算されます。

---
薬局管理システム
```

---

## 変数一覧

### 共通変数
```
{{user_name}} - ユーザー名
{{email}} - メールアドレス
{{verification_url}} - メール認証URL
{{reset_url}} - パスワードリセットURL
{{dashboard_url}} - ダッシュボードURL
```

### 薬局関連変数
```
{{pharmacy_name}} - 薬局名
{{pharmacy_address}} - 薬局住所
{{pharmacy_phone}} - 薬局電話番号
{{contact_person}} - 担当者名
{{job_title}} - 求人タイトル
{{work_location}} - 勤務地
{{daily_wage}} - 日給
{{work_days}} - 勤務日数
{{deadline}} - 募集期限
{{job_url}} - 求人詳細URL
```

### 薬剤師関連変数
```
{{pharmacist_name}} - 薬剤師氏名
{{pharmacist_phone}} - 薬剤師電話番号
{{pharmacist_email}} - 薬剤師メールアドレス
{{applicant_code}} - 応募者コード（例: A, B, C）
{{age}} - 年齢
{{experience_years}} - 経験年数
{{experience_months}} - 経験月数
{{nearest_station}} - 最寄駅
```

### 契約関連変数
```
{{contract_id}} - 契約ID
{{initial_work_date}} - 初回出勤日
{{total_compensation}} - 報酬総額
{{platform_fee}} - プラットフォーム手数料
{{payment_deadline}} - 支払期限
{{work_hours}} - 勤務時間
{{candidate_dates}} - 候補日リスト
{{selected_date}} - 選択された日付
```

### URL関連変数
```
{{application_url}} - 応募詳細URL
{{send_offer_url}} - オファー送信URL
{{invoice_url}} - 請求書URL
{{payment_url}} - 支払いページURL
{{contract_url}} - 契約詳細URL
{{offer_url}} - オファー確認URL
{{select_date_url}} - 日付選択URL
{{upload_url}} - 証明書アップロードURL
{{job_search_url}} - 求人検索URL
```

---

## メール送信タイミング一覧

### トリガーイベント

| # | メール名 | トリガー | 受信者 | 優先度 |
|---|---------|---------|--------|--------|
| 1 | メールアドレス確認 | ユーザー登録時 | 登録者 | 高 |
| 2 | パスワードリセット | リセット要求時 | 該当ユーザー | 高 |
| 3 | アカウント作成完了 | メール認証完了後 | 登録者 | 中 |
| 4 | 求人公開完了 | 求人公開時 | 薬局 | 中 |
| 5 | 新規応募通知 | 応募時 | 薬局 | 高 |
| 6 | メッセージ受信 | メッセージ送信時 | 受信者 | 中 |
| 7 | 初回出勤日選択 | 日付選択時 | 薬局 | 高 |
| 8 | 初回出勤日候補 | 候補提示時 | 薬剤師 | 高 |
| 9 | 正式オファー受信 | オファー送信時 | 薬剤師 | 高 |
| 10 | 契約成立 | オファー承認時 | 双方 | 高 |
| 11 | 支払期限リマインダー | 期限3日前、1日前 | 薬局 | 高 |
| 12 | 支払確認完了 | 支払確認時 | 双方 | 高 |
| 13 | 契約キャンセル | 期限超過時 | 薬局 | 高 |
| 14 | ペナルティ適用 | 契約キャンセル時 | 薬局 | 高 |
| 15 | 資格証明書承認 | 承認時 | 薬剤師 | 高 |
| 16 | 資格証明書差戻 | 差戻時 | 薬剤師 | 高 |

---

以上、メールテンプレート集
