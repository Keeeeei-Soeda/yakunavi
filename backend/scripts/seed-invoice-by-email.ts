/**
 * 指定メールでログインしている薬局にダミー請求書を1件作成するスクリプト
 * 使用例: npx ts-node scripts/seed-invoice-by-email.ts k.soeda.mediforce@gmail.com
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_EMAIL = process.argv[2] || 'k.soeda.mediforce@gmail.com';

async function main() {
  console.log(`📄 ${TARGET_EMAIL} の薬局にダミー請求書を作成します...`);

  let pharmacy: { id: bigint; pharmacyName: string | null; companyName: string; address: string | null; prefecture: string | null; user?: { email: string } };
  let actualLoginEmail = TARGET_EMAIL;

  const user = await prisma.user.findUnique({
    where: { email: TARGET_EMAIL },
    include: { pharmacy: true },
  });

  if (user?.userType === 'pharmacy' && user.pharmacy) {
    pharmacy = user.pharmacy;
    actualLoginEmail = user.email;
  } else {
    const byCompany = await prisma.pharmacy.findFirst({
      where: {
        OR: [
          { companyName: { contains: 'テスト大空' } },
          { companyName: { contains: '大空' } },
          { pharmacyName: { contains: '大空' } },
        ],
      },
      include: { user: { select: { email: true } } },
    });
    if (!byCompany) {
      throw new Error(
        `メール「${TARGET_EMAIL}」に紐づく薬局も、「株式会社テスト大空薬局」の薬局も見つかりません。` +
          `登録済みの薬局メールか、会社名を確認してください。`
      );
    }
    pharmacy = byCompany;
    actualLoginEmail = byCompany.user?.email ?? TARGET_EMAIL;
    console.log(
      `  ℹ️ メール「${TARGET_EMAIL}」の薬局は見つからなかったため、会社名で検索した「${byCompany.companyName}」に請求書を追加します。`
    );
  }
  const pharmacyId = pharmacy.id;
  const pharmacyLabel =
    pharmacy.pharmacyName || pharmacy.companyName || `薬局ID:${pharmacyId}`;

  console.log(`  ✅ 薬局: ${pharmacyLabel} (ID: ${pharmacyId})`);
  if (actualLoginEmail !== TARGET_EMAIL) {
    console.log(`  ℹ️ この薬局のログインメール: ${actualLoginEmail}`);
  }

  const now = new Date();
  const initialWorkDate = new Date(now);
  initialWorkDate.setDate(now.getDate() + 14);
  const paymentDeadline = new Date(initialWorkDate);
  paymentDeadline.setDate(paymentDeadline.getDate() - 3);

  const pharmacist = await prisma.pharmacist.findFirst({
    where: { verificationStatus: 'verified' },
    orderBy: { id: 'asc' },
  });

  if (!pharmacist) {
    throw new Error(
      '確認済みの薬剤師が1名もいません。先にシードで薬剤師を作成してください。'
    );
  }

  const workStartFrom = new Date(now);
  workStartFrom.setDate(now.getDate() + 14);
  const workStartTo = new Date(workStartFrom);
  workStartTo.setDate(workStartFrom.getDate() + 30);
  const recruitmentDeadline = new Date(now);
  recruitmentDeadline.setDate(now.getDate() + 7);

  const jobPosting = await prisma.jobPosting.create({
    data: {
      pharmacyId,
      title: '調剤薬局での短期勤務（ダミー求人）',
      workLocation: pharmacy.address || pharmacy.prefecture || '勤務地',
      description: '請求書テスト用のダミー求人です。',
      dailyWage: 26000,
      desiredWorkDays: 30,
      totalCompensation: 780000,
      platformFee: 312000,
      workStartPeriodFrom: workStartFrom,
      workStartPeriodTo: workStartTo,
      recruitmentDeadline,
      desiredWorkHours: '9:00-18:00',
      requirements: '薬剤師免許',
      status: 'published',
      publishedAt: now,
    },
  });

  const application = await prisma.application.create({
    data: {
      jobPostingId: jobPosting.id,
      pharmacistId: pharmacist.id,
      status: 'accepted',
      coverLetter: 'ダミー応募です。',
      nearestStation: '最寄り駅',
      appliedAt: now,
      respondedAt: now,
    },
  });

  const workDays = 30;
  const dailyWage = 26000;
  const totalCompensation = workDays * dailyWage;
  const platformFee = Math.floor(totalCompensation * 0.4);
  const platformFeeTaxInclusive = Math.floor(platformFee * 1.1);

  const contract = await prisma.contract.create({
    data: {
      applicationId: application.id,
      pharmacyId,
      pharmacistId: pharmacist.id,
      jobPostingId: jobPosting.id,
      initialWorkDate,
      workDays,
      dailyWage,
      totalCompensation,
      platformFee,
      workHours: '9:00-18:00',
      status: 'pending_payment',
      paymentDeadline,
      approvedAt: now,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      contractId: contract.id,
      pharmacyId,
      amount: platformFeeTaxInclusive,
      paymentType: 'platform_fee',
      paymentStatus: 'pending',
    },
  });

  console.log('\n✅ ダミー請求書の作成が完了しました。');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`【薬局】${pharmacyLabel}`);
  console.log(`  ログイン: ${actualLoginEmail}`);
  console.log(`  請求書一覧: /pharmacy/payments`);
  console.log(`  請求書詳細: /pharmacy/payments/${payment.id}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('【契約内容（ダミー）】');
  console.log(`  薬剤師: ${pharmacist.lastName} ${pharmacist.firstName}`);
  console.log(`  初回出勤日: ${initialWorkDate.toISOString().slice(0, 10)}`);
  console.log(`  勤務日数: ${workDays}日 / 日給: ¥${dailyWage.toLocaleString()}`);
  console.log(`  報酬総額: ¥${totalCompensation.toLocaleString()}`);
  console.log(`  プラットフォーム手数料(税込): ¥${platformFeeTaxInclusive.toLocaleString()}`);
  console.log(`  支払い期限: ${paymentDeadline.toISOString().slice(0, 10)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ エラー:', e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
