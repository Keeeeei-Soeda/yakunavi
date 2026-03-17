/**
 * 株式会社テスト大空薬局 向けダミー請求書データを作成するスクリプト
 * 実行: npm run seed:invoice:oozora
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const OOZORA_EMAIL = 'oozora@test.com';
const PHARMACY_NAME = '株式会社テスト大空薬局';

async function main() {
  console.log('📄 株式会社テスト大空薬局 向けダミー請求書の作成を開始します...');

  const hashedPassword = await bcrypt.hash('password123', 10);
  const now = new Date();
  const initialWorkDate = new Date(now);
  initialWorkDate.setDate(now.getDate() + 14);
  const paymentDeadline = new Date(initialWorkDate);
  paymentDeadline.setDate(paymentDeadline.getDate() - 3);

  // 既存のテスト大空薬局ユーザーを確認
  let oozoraUser = await prisma.user.findUnique({
    where: { email: OOZORA_EMAIL },
  });

  let pharmacyId: bigint;

  if (oozoraUser) {
    const pharmacy = await prisma.pharmacy.findFirst({
      where: { userId: oozoraUser.id },
    });
    if (!pharmacy) {
      throw new Error('ユーザーは存在しますが薬局レコードが見つかりません');
    }
    pharmacyId = pharmacy.id;
    console.log(`  ✅ 既存の薬局を使用します (ID: ${pharmacyId})`);

    // 既にこの薬局の請求書（支払い待ち）が1件以上あればスキップ
    const existingPayment = await prisma.payment.findFirst({
      where: { pharmacyId },
    });
    if (existingPayment) {
      console.log(`  ℹ️ 既に請求書が存在します (Payment ID: ${existingPayment.id})`);
      console.log('  → 請求書一覧: /pharmacy/payments');
      console.log(`  → 請求書詳細: /pharmacy/payments/${existingPayment.id}`);
      return;
    }
  } else {
    oozoraUser = await prisma.user.create({
      data: {
        email: OOZORA_EMAIL,
        password: hashedPassword,
        userType: 'pharmacy',
        emailVerified: true,
        isActive: true,
      },
    });

    const pharmacy = await prisma.pharmacy.create({
      data: {
        userId: oozoraUser.id,
        companyName: PHARMACY_NAME,
        pharmacyName: 'テスト大空薬局',
        representativeLastName: '大空',
        representativeFirstName: '太郎',
        phoneNumber: '06-1234-5678',
        prefecture: '大阪府',
        address: '大阪府大阪市北区大空町1-2-3',
        nearestStation: '梅田駅',
        minutesFromStation: 8,
        carCommuteAvailable: true,
        establishedDate: new Date('2012-04-01'),
        dailyPrescriptionCount: 100,
        staffCount: 6,
        businessHoursStart: new Date('1970-01-01T09:00:00'),
        businessHoursEnd: new Date('1970-01-01T18:00:00'),
        introduction: 'テスト用のダミー薬局です。請求書確認用。',
      },
    });
    pharmacyId = pharmacy.id;
    console.log(`  ✅ 薬局を作成しました (ID: ${pharmacyId})`);
  }

  // 既存の薬剤師を1名取得（確認済みを優先）
  const pharmacist = await prisma.pharmacist.findFirst({
    where: { verificationStatus: 'verified' },
    orderBy: { id: 'asc' },
  });

  if (!pharmacist) {
    throw new Error('薬剤師が1名も登録されていません。先に npm run prisma:seed を実行してください。');
  }

  // 求人を作成（この薬局用）
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
      workLocation: '大阪府大阪市北区大空町1-2-3',
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

  // 応募を作成
  const application = await prisma.application.create({
    data: {
      jobPostingId: jobPosting.id,
      pharmacistId: pharmacist.id,
      status: 'accepted',
      coverLetter: 'ダミー応募です。',
      nearestStation: '梅田駅',
      appliedAt: now,
      respondedAt: now,
    },
  });

  // 契約内容（適宜）
  const workDays = 30;
  const dailyWage = 26000;
  const totalCompensation = workDays * dailyWage; // 780,000
  const platformFee = Math.floor(totalCompensation * 0.4); // 312,000
  const platformFeeTaxInclusive = Math.floor(platformFee * 1.1); // 343,200

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
  console.log(`【薬局】${PHARMACY_NAME}`);
  console.log(`  ログイン: ${OOZORA_EMAIL} / password123`);
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
    console.error('❌ エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
