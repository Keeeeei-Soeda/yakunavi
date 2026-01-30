# シリアルコンソールからアカウント情報を確認する方法

## 📋 目次

1. [薬剤師アカウント一覧を確認](#薬剤師アカウント一覧を確認)
2. [薬局アカウント一覧を確認](#薬局アカウント一覧を確認)
3. [特定のアカウント詳細を確認](#特定のアカウント詳細を確認)
4. [統計情報を確認](#統計情報を確認)
5. [Prisma Studioを使用する方法](#prisma-studioを使用する方法)

---

## 1. 薬剤師アカウント一覧を確認

### 基本的な一覧表示

```bash
cd ~/yaku_navi/backend && npx ts-node -e "
import prisma from './src/utils/prisma';
(async () => {
  const pharmacists = await prisma.pharmacist.findMany({
    include: {
      user: {
        select: {
          email: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  console.log('=== 薬剤師アカウント一覧 ===');
  console.log(\`総数: \${pharmacists.length}件\n\`);
  pharmacists.forEach((p, i) => {
    console.log(\`[\${i + 1}] ID: \${p.id}\`);
    console.log(\`    氏名: \${p.lastName} \${p.firstName}\`);
    console.log(\`    メール: \${p.user.email}\`);
    console.log(\`    電話: \${p.phoneNumber || '未設定'}\`);
    console.log(\`    住所: \${p.address || '未設定'}\`);
    console.log(\`    証明書: \${p.verificationStatus}\`);
    console.log(\`    登録日: \${p.createdAt.toLocaleString('ja-JP')}\`);
    console.log(\`    ステータス: \${p.user.isActive ? 'アクティブ' : '停止中'}\`);
    console.log('');
  });
  await prisma.\$disconnect();
})();
"
```

### 簡易版（メールと氏名のみ）

```bash
cd ~/yaku_navi/backend && npx ts-node -e "
import prisma from './src/utils/prisma';
(async () => {
  const pharmacists = await prisma.pharmacist.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  console.log('=== 薬剤師アカウント一覧 ===');
  pharmacists.forEach((p) => {
    console.log(\`ID: \${p.id} | \${p.lastName} \${p.firstName} | \${p.user.email}\`);
  });
  await prisma.\$disconnect();
})();
"
```

### 証明書ステータス別に確認

```bash
cd ~/yaku_navi/backend && npx ts-node -e "
import prisma from './src/utils/prisma';
(async () => {
  const pending = await prisma.pharmacist.findMany({
    where: { verificationStatus: 'pending' },
    include: { user: { select: { email: true } } },
  });
  const verified = await prisma.pharmacist.findMany({
    where: { verificationStatus: 'verified' },
    include: { user: { select: { email: true } } },
  });
  console.log('=== 証明書ステータス別 ===');
  console.log(\`未確認: \${pending.length}件\`);
  console.log(\`確認済み: \${verified.length}件\n\`);
  console.log('【未確認】');
  pending.forEach((p) => {
    console.log(\`  ID: \${p.id} | \${p.lastName} \${p.firstName} | \${p.user.email}\`);
  });
  await prisma.\$disconnect();
})();
"
```

---

## 2. 薬局アカウント一覧を確認

### 基本的な一覧表示

```bash
cd ~/yaku_navi/backend && npx ts-node -e "
import prisma from './src/utils/prisma';
(async () => {
  const pharmacies = await prisma.pharmacy.findMany({
    include: {
      user: {
        select: {
          email: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  console.log('=== 薬局アカウント一覧 ===');
  console.log(\`総数: \${pharmacies.length}件\n\`);
  pharmacies.forEach((p, i) => {
    console.log(\`[\${i + 1}] ID: \${p.id}\`);
    console.log(\`    薬局名: \${p.pharmacyName}\`);
    console.log(\`    代表者: \${p.representativeLastName} \${p.representativeFirstName}\`);
    console.log(\`    メール: \${p.user.email}\`);
    console.log(\`    電話: \${p.phoneNumber || '未設定'}\`);
    console.log(\`    住所: \${p.address || '未設定'}\`);
    console.log(\`    登録日: \${p.createdAt.toLocaleString('ja-JP')}\`);
    console.log(\`    ステータス: \${p.user.isActive ? 'アクティブ' : '停止中'}\`);
    console.log('');
  });
  await prisma.\$disconnect();
})();
"
```

### 簡易版（メールと薬局名のみ）

```bash
cd ~/yaku_navi/backend && npx ts-node -e "
import prisma from './src/utils/prisma';
(async () => {
  const pharmacies = await prisma.pharmacy.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  console.log('=== 薬局アカウント一覧 ===');
  pharmacies.forEach((p) => {
    console.log(\`ID: \${p.id} | \${p.pharmacyName} | \${p.user.email}\`);
  });
  await prisma.\$disconnect();
})();
"
```

---

## 3. 特定のアカウント詳細を確認

### 薬剤師の詳細情報（ID指定）

```bash
cd ~/yaku_navi/backend && npx ts-node -e "
import prisma from './src/utils/prisma';
const pharmacistId = 1; // 確認したい薬剤師ID
(async () => {
  const pharmacist = await prisma.pharmacist.findUnique({
    where: { id: BigInt(pharmacistId) },
    include: {
      user: {
        select: {
          email: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      },
      certificates: true,
    },
  });
  if (!pharmacist) {
    console.log('薬剤師が見つかりません');
  } else {
    console.log('=== 薬剤師詳細 ===');
    console.log(\`ID: \${pharmacist.id}\`);
    console.log(\`氏名: \${pharmacist.lastName} \${pharmacist.firstName}\`);
    console.log(\`メール: \${pharmacist.user.email}\`);
    console.log(\`電話: \${pharmacist.phoneNumber || '未設定'}\`);
    console.log(\`住所: \${pharmacist.address || '未設定'}\`);
    console.log(\`生年月日: \${pharmacist.birthDate ? pharmacist.birthDate.toLocaleDateString('ja-JP') : '未設定'}\`);
    console.log(\`年齢: \${pharmacist.age || '未設定'}\`);
    console.log(\`最寄駅: \${pharmacist.nearestStation || '未設定'}\`);
    console.log(\`出身大学: \${pharmacist.university || '未設定'}\`);
    console.log(\`卒業年: \${pharmacist.graduationYear || '未設定'}\`);
    console.log(\`免許番号: \${pharmacist.licenseNumber || '未設定'}\`);
    console.log(\`免許取得年: \${pharmacist.licenseYear || '未設定'}\`);
    console.log(\`証明書ステータス: \${pharmacist.verificationStatus}\`);
    console.log(\`確認日: \${pharmacist.verifiedAt ? pharmacist.verifiedAt.toLocaleString('ja-JP') : '未確認'}\`);
    console.log(\`登録日: \${pharmacist.createdAt.toLocaleString('ja-JP')}\`);
    console.log(\`最終ログイン: \${pharmacist.user.lastLoginAt ? pharmacist.user.lastLoginAt.toLocaleString('ja-JP') : '未ログイン'}\`);
    console.log(\`ステータス: \${pharmacist.user.isActive ? 'アクティブ' : '停止中'}\`);
    console.log(\`\n資格証明書: \${pharmacist.certificates.length}件\`);
    pharmacist.certificates.forEach((cert, i) => {
      console.log(\`  [\${i + 1}] \${cert.certificateType}: \${cert.verificationStatus} (\${cert.fileName})\`);
    });
  }
  await prisma.\$disconnect();
})();
"
```

### 薬局の詳細情報（ID指定）

```bash
cd ~/yaku_navi/backend && npx ts-node -e "
import prisma from './src/utils/prisma';
const pharmacyId = 1; // 確認したい薬局ID
(async () => {
  const pharmacy = await prisma.pharmacy.findUnique({
    where: { id: BigInt(pharmacyId) },
    include: {
      user: {
        select: {
          email: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      },
      jobPostings: {
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });
  if (!pharmacy) {
    console.log('薬局が見つかりません');
  } else {
    console.log('=== 薬局詳細 ===');
    console.log(\`ID: \${pharmacy.id}\`);
    console.log(\`薬局名: \${pharmacy.pharmacyName}\`);
    console.log(\`代表者: \${pharmacy.representativeLastName} \${pharmacy.representativeFirstName}\`);
    console.log(\`メール: \${pharmacy.user.email}\`);
    console.log(\`電話: \${pharmacy.phoneNumber || '未設定'}\`);
    console.log(\`FAX: \${pharmacy.faxNumber || '未設定'}\`);
    console.log(\`都道府県: \${pharmacy.prefecture || '未設定'}\`);
    console.log(\`住所: \${pharmacy.address || '未設定'}\`);
    console.log(\`最寄駅: \${pharmacy.nearestStation || '未設定'}\`);
    console.log(\`登録日: \${pharmacy.createdAt.toLocaleString('ja-JP')}\`);
    console.log(\`最終ログイン: \${pharmacy.user.lastLoginAt ? pharmacy.user.lastLoginAt.toLocaleString('ja-JP') : '未ログイン'}\`);
    console.log(\`ステータス: \${pharmacy.user.isActive ? 'アクティブ' : '停止中'}\`);
    console.log(\`\n求人投稿数: \${pharmacy.jobPostings.length}件\`);
    pharmacy.jobPostings.forEach((job, i) => {
      console.log(\`  [\${i + 1}] ID: \${job.id} | \${job.title} | ステータス: \${job.status}\`);
    });
  }
  await prisma.\$disconnect();
})();
"
```

### メールアドレスで検索

```bash
cd ~/yaku_navi/backend && npx ts-node -e "
import prisma from './src/utils/prisma';
const email = 'pharmacist1@test.com'; // 検索したいメールアドレス
(async () => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      pharmacist: {
        include: {
          certificates: true,
        },
      },
      pharmacy: true,
    },
  });
  if (!user) {
    console.log('ユーザーが見つかりません');
  } else {
    console.log('=== ユーザー情報 ===');
    console.log(\`メール: \${user.email}\`);
    console.log(\`ユーザータイプ: \${user.userType}\`);
    console.log(\`登録日: \${user.createdAt.toLocaleString('ja-JP')}\`);
    if (user.pharmacist) {
      console.log(\`\n薬剤師情報:\`);
      console.log(\`  氏名: \${user.pharmacist.lastName} \${user.pharmacist.firstName}\`);
      console.log(\`  電話: \${user.pharmacist.phoneNumber || '未設定'}\`);
      console.log(\`  証明書: \${user.pharmacist.verificationStatus}\`);
    }
    if (user.pharmacy) {
      console.log(\`\n薬局情報:\`);
      console.log(\`  薬局名: \${user.pharmacy.pharmacyName}\`);
      console.log(\`  代表者: \${user.pharmacy.representativeLastName} \${user.pharmacy.representativeFirstName}\`);
      console.log(\`  電話: \${user.pharmacy.phoneNumber || '未設定'}\`);
    }
  }
  await prisma.\$disconnect();
})();
"
```

---

## 4. 統計情報を確認

### アカウント数の統計

```bash
cd ~/yaku_navi/backend && npx ts-node -e "
import prisma from './src/utils/prisma';
(async () => {
  const pharmacyCount = await prisma.pharmacy.count();
  const pharmacistCount = await prisma.pharmacist.count();
  const activePharmacyCount = await prisma.pharmacy.count({
    where: { user: { isActive: true } },
  });
  const activePharmacistCount = await prisma.pharmacist.count({
    where: { user: { isActive: true } },
  });
  const verifiedPharmacistCount = await prisma.pharmacist.count({
    where: { verificationStatus: 'verified' },
  });
  const pendingPharmacistCount = await prisma.pharmacist.count({
    where: { verificationStatus: 'pending' },
  });
  console.log('=== アカウント統計 ===');
  console.log(\`薬局: \${pharmacyCount}件（アクティブ: \${activePharmacyCount}件）\`);
  console.log(\`薬剤師: \${pharmacistCount}件（アクティブ: \${activePharmacistCount}件）\`);
  console.log(\`証明書確認済み: \${verifiedPharmacistCount}件\`);
  console.log(\`証明書未確認: \${pendingPharmacistCount}件\`);
  await prisma.\$disconnect();
})();
"
```

### 最近登録されたアカウント

```bash
cd ~/yaku_navi/backend && npx ts-node -e "
import prisma from './src/utils/prisma';
(async () => {
  const recentPharmacists = await prisma.pharmacist.findMany({
    take: 10,
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const recentPharmacies = await prisma.pharmacy.findMany({
    take: 10,
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  console.log('=== 最近登録された薬剤師（最新10件） ===');
  recentPharmacists.forEach((p) => {
    console.log(\`\${p.createdAt.toLocaleDateString('ja-JP')} | \${p.lastName} \${p.firstName} | \${p.user.email}\`);
  });
  console.log(\`\n=== 最近登録された薬局（最新10件） ===\`);
  recentPharmacies.forEach((p) => {
    console.log(\`\${p.createdAt.toLocaleDateString('ja-JP')} | \${p.pharmacyName} | \${p.user.email}\`);
  });
  await prisma.\$disconnect();
})();
"
```

---

## 5. Prisma Studioを使用する方法

### Prisma Studioを起動

```bash
cd ~/yaku_navi/backend
npx prisma studio
```

ブラウザで `http://localhost:5555` にアクセスすると、GUIでデータベースを確認できます。

**注意**: シリアルコンソールからは直接ブラウザを開けないため、SSHポートフォワーディングが必要です。

### SSHポートフォワーディング（ローカルPCから）

```bash
# ローカルPCのターミナルで実行
ssh -L 5555:localhost:5555 root@85.131.247.170

# 別のターミナルで
cd ~/yaku_navi/backend
npx prisma studio
```

その後、ローカルブラウザで `http://localhost:5555` にアクセスできます。

---

## 6. 便利なワンライナー

### 薬剤師の総数とメール一覧

```bash
cd ~/yaku_navi/backend && npx ts-node -e "import prisma from './src/utils/prisma'; (async () => { const p = await prisma.pharmacist.findMany({ include: { user: { select: { email: true } } } }); console.log(\`総数: \${p.length}件\n\`); p.forEach(x => console.log(\`\${x.user.email} | \${x.lastName} \${x.firstName}\`)); await prisma.\$disconnect(); })();"
```

### 薬局の総数とメール一覧

```bash
cd ~/yaku_navi/backend && npx ts-node -e "import prisma from './src/utils/prisma'; (async () => { const p = await prisma.pharmacy.findMany({ include: { user: { select: { email: true } } } }); console.log(\`総数: \${p.length}件\n\`); p.forEach(x => console.log(\`\${x.user.email} | \${x.pharmacyName}\`)); await prisma.\$disconnect(); })();"
```

### ダミーアカウントのみを表示

```bash
cd ~/yaku_navi/backend && npx ts-node -e "import prisma from './src/utils/prisma'; (async () => { const users = await prisma.user.findMany({ where: { email: { contains: 'dummy' } }, include: { pharmacist: true, pharmacy: true } }); console.log(\`ダミーアカウント: \${users.length}件\n\`); users.forEach(u => { if (u.pharmacist) console.log(\`薬剤師: \${u.email} | \${u.pharmacist.lastName} \${u.pharmacist.firstName}\`); if (u.pharmacy) console.log(\`薬局: \${u.email} | \${u.pharmacy.pharmacyName}\`); }); await prisma.\$disconnect(); })();"
```

---

## 7. 短いコマンド（推奨）

### npmスクリプトを使用（最も簡単）

```bash
# 薬剤師一覧
cd ~/yaku_navi/backend && npm run list:pharmacists

# 薬局一覧
cd ~/yaku_navi/backend && npm run list:pharmacies

# 統計情報
cd ~/yaku_navi/backend && npm run stats
```

### さらに短く（エイリアス設定）

シリアルコンソールで以下を実行すると、さらに短くできます：

```bash
# エイリアスを設定（.bashrc または .zshrc に追加）
alias ph-list='cd ~/yaku_navi/backend && npm run list:pharmacists'
alias pha-list='cd ~/yaku_navi/backend && npm run list:pharmacies'
alias ph-stats='cd ~/yaku_navi/backend && npm run stats'

# 使用例
ph-list      # 薬剤師一覧
pha-list     # 薬局一覧
ph-stats     # 統計情報
```

---

## 8. トラブルシューティング

### エラー: "Cannot find module"

```bash
cd ~/yaku_navi/backend
npm install
```

### エラー: "Cannot connect to database"

1. データベースが起動しているか確認:
```bash
sudo systemctl status postgresql
```

2. `.env` ファイルの `DATABASE_URL` を確認:
```bash
cat .env | grep DATABASE_URL
```

### エラー: "Permission denied"

```bash
sudo chown -R $USER:$USER ~/yaku_navi
```

---

**最終更新**: 2026年1月28日

