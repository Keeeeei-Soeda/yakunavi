# 本番環境でスクリプトを追加する方法

## 問題

`npm run list:pharmacists` などのコマンドで "Missing script" エラーが出る場合、本番環境にスクリプトが反映されていません。

## 解決方法

### 方法1: シリアルコンソールで直接追加（最速）

#### 1. package.jsonを編集

```bash
cd ~/yaku_navi/backend
nano package.json
```

16行目の `"add:dummy"` の後に、以下の3行を追加:

```json
    "list:pharmacists": "ts-node scripts/list-pharmacists.ts",
    "list:pharmacies": "ts-node scripts/list-pharmacies.ts",
    "stats": "ts-node scripts/stats.ts",
```

保存: `Ctrl+O` → `Enter` → `Ctrl+X`

#### 2. スクリプトファイルを作成

```bash
# list-pharmacists.ts を作成
cat > ~/yaku_navi/backend/scripts/list-pharmacists.ts << 'EOF'
import prisma from '../src/utils/prisma';

async function listPharmacists() {
  const pharmacists = await prisma.pharmacist.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`薬剤師: ${pharmacists.length}件\n`);
  pharmacists.forEach((p) => {
    console.log(`${p.id} | ${p.lastName} ${p.firstName} | ${p.user.email}`);
  });
  await prisma.$disconnect();
}

listPharmacists();
EOF
```

```bash
# list-pharmacies.ts を作成
cat > ~/yaku_navi/backend/scripts/list-pharmacies.ts << 'EOF'
import prisma from '../src/utils/prisma';

async function listPharmacies() {
  const pharmacies = await prisma.pharmacy.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`薬局: ${pharmacies.length}件\n`);
  pharmacies.forEach((p) => {
    console.log(`${p.id} | ${p.pharmacyName} | ${p.user.email}`);
  });
  await prisma.$disconnect();
}

listPharmacies();
EOF
```

```bash
# stats.ts を作成
cat > ~/yaku_navi/backend/scripts/stats.ts << 'EOF'
import prisma from '../src/utils/prisma';

async function stats() {
  const ph = await prisma.pharmacy.count();
  const pa = await prisma.pharmacist.count();
  const v = await prisma.pharmacist.count({ where: { verificationStatus: 'verified' } });
  const p = await prisma.pharmacist.count({ where: { verificationStatus: 'pending' } });
  console.log('=== 統計 ===');
  console.log(`薬局: ${ph}件`);
  console.log(`薬剤師: ${pa}件`);
  console.log(`証明書確認済み: ${v}件`);
  console.log(`証明書未確認: ${p}件`);
  await prisma.$disconnect();
}

stats();
EOF
```

#### 3. 動作確認

```bash
npm run list:pharmacists
npm run list:pharmacies
npm run stats
```

---

### 方法2: Git経由で更新（推奨）

#### ローカルで実行

```bash
# 変更をコミット
git add backend/package.json backend/scripts/*.ts
git commit -m "feat: アカウント確認用スクリプトを追加"
git push origin main
```

#### サーバーで実行

```bash
cd ~/yaku_navi/backend
git pull origin main
```

---

## 一括実行コマンド（シリアルコンソールでコピー&ペースト）

```bash
cd ~/yaku_navi/backend && \
cat > scripts/list-pharmacists.ts << 'EOF'
import prisma from '../src/utils/prisma';

async function listPharmacists() {
  const pharmacists = await prisma.pharmacist.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`薬剤師: ${pharmacists.length}件\n`);
  pharmacists.forEach((p) => {
    console.log(`${p.id} | ${p.lastName} ${p.firstName} | ${p.user.email}`);
  });
  await prisma.$disconnect();
}

listPharmacists();
EOF
cat > scripts/list-pharmacies.ts << 'EOF'
import prisma from '../src/utils/prisma';

async function listPharmacies() {
  const pharmacies = await prisma.pharmacy.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`薬局: ${pharmacies.length}件\n`);
  pharmacies.forEach((p) => {
    console.log(`${p.id} | ${p.pharmacyName} | ${p.user.email}`);
  });
  await prisma.$disconnect();
}

listPharmacies();
EOF
cat > scripts/stats.ts << 'EOF'
import prisma from '../src/utils/prisma';

async function stats() {
  const ph = await prisma.pharmacy.count();
  const pa = await prisma.pharmacist.count();
  const v = await prisma.pharmacist.count({ where: { verificationStatus: 'verified' } });
  const p = await prisma.pharmacist.count({ where: { verificationStatus: 'pending' } });
  console.log('=== 統計 ===');
  console.log(`薬局: ${ph}件`);
  console.log(`薬剤師: ${pa}件`);
  console.log(`証明書確認済み: ${v}件`);
  console.log(`証明書未確認: ${p}件`);
  await prisma.$disconnect();
}

stats();
EOF
echo "✅ スクリプトファイルを作成しました"
```

その後、`package.json` を編集:

```bash
nano package.json
```

16行目の後に以下を追加:
```json
    "list:pharmacists": "ts-node scripts/list-pharmacists.ts",
    "list:pharmacies": "ts-node scripts/list-pharmacies.ts",
    "stats": "ts-node scripts/stats.ts",
```

---

**最終更新**: 2026年1月28日

