import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 シードデータの作成を開始します...');

    // パスワードをハッシュ化（全アカウント共通: password123）
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 既存データをクリーンアップ（オプション）
    console.log('🧹 既存データをクリーンアップ...');
    await prisma.application.deleteMany();
    await prisma.jobPosting.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.certificate.deleteMany();
    await prisma.pharmacist.deleteMany();
    await prisma.pharmacy.deleteMany();
    await prisma.user.deleteMany();

    // ============================================
    // 薬局アカウント1
    // ============================================
    console.log('📦 薬局アカウント1を作成中...');
    const pharmacyUser1 = await prisma.user.create({
        data: {
            email: 'pharmacy1@test.com',
            password: hashedPassword,
            userType: 'pharmacy',
            emailVerified: true,
            isActive: true,
        },
    });

    const pharmacy1 = await prisma.pharmacy.create({
        data: {
            userId: pharmacyUser1.id,
            pharmacyName: 'テスト薬局 新宿店',
            representativeLastName: '山田',
            representativeFirstName: '太郎',
            phoneNumber: '03-1234-5678',
            prefecture: '東京都',
            address: '東京都新宿区新宿1-1-1',
            nearestStation: '新宿駅',
            introduction: '地域密着型の調剤薬局です。患者様第一をモットーに、丁寧な服薬指導を心がけています。',
            staffCount: 5,
            dailyPrescriptionCount: 150,
        },
    });

    // ============================================
    // 薬局アカウント2
    // ============================================
    console.log('📦 薬局アカウント2を作成中...');
    const pharmacyUser2 = await prisma.user.create({
        data: {
            email: 'pharmacy2@test.com',
            password: hashedPassword,
            userType: 'pharmacy',
            emailVerified: true,
            isActive: true,
        },
    });

    const pharmacy2 = await prisma.pharmacy.create({
        data: {
            userId: pharmacyUser2.id,
            pharmacyName: 'サンプル薬局 渋谷店',
            representativeLastName: '佐藤',
            representativeFirstName: '花子',
            phoneNumber: '03-9876-5432',
            prefecture: '東京都',
            address: '東京都渋谷区渋谷2-2-2',
            nearestStation: '渋谷駅',
            introduction: '最新の設備とシステムを導入した調剤薬局です。効率的な業務を実現しています。',
            staffCount: 8,
            dailyPrescriptionCount: 200,
        },
    });

    // ============================================
    // 薬剤師アカウント1
    // ============================================
    console.log('👨‍⚕️ 薬剤師アカウント1を作成中...');
    const pharmacistUser1 = await prisma.user.create({
        data: {
            email: 'pharmacist1@test.com',
            password: hashedPassword,
            userType: 'pharmacist',
            emailVerified: true,
            isActive: true,
        },
    });

    const pharmacist1 = await prisma.pharmacist.create({
        data: {
            userId: pharmacistUser1.id,
            lastName: '田中',
            firstName: '一郎',
            phoneNumber: '090-1111-2222',
            birthDate: new Date('1990-05-15'),
            age: 34,
            nearestStation: '新宿駅',
            university: '東京薬科大学',
            graduationYear: 2012,
            licenseYear: 2012,
            workExperienceYears: 12,
            workExperienceMonths: 0,
            workExperienceTypes: ['調剤薬局', 'ドラッグストア'],
            mainDuties: ['調剤', '服薬指導', '在庫管理'],
            specialtyAreas: ['循環器', '糖尿病'],
            pharmacySystems: ['調剤システムA', '調剤システムB'],
            selfIntroduction: '12年間の調剤薬局での経験を活かし、患者様に寄り添った服薬指導を心がけています。',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
        },
    });

    // 薬剤師1の証明書
    await prisma.certificate.create({
        data: {
            pharmacistId: pharmacist1.id,
            certificateType: 'license',
            filePath: '/uploads/certificates/test-license-1.pdf',
            fileName: '薬剤師免許証.pdf',
            verificationStatus: 'verified',
        },
    });

    await prisma.certificate.create({
        data: {
            pharmacistId: pharmacist1.id,
            certificateType: 'registration',
            filePath: '/uploads/certificates/test-registration-1.pdf',
            fileName: '保険薬剤師登録票.pdf',
            verificationStatus: 'verified',
        },
    });

    // ============================================
    // 薬剤師アカウント2
    // ============================================
    console.log('👨‍⚕️ 薬剤師アカウント2を作成中...');
    const pharmacistUser2 = await prisma.user.create({
        data: {
            email: 'pharmacist2@test.com',
            password: hashedPassword,
            userType: 'pharmacist',
            emailVerified: true,
            isActive: true,
        },
    });

    const pharmacist2 = await prisma.pharmacist.create({
        data: {
            userId: pharmacistUser2.id,
            lastName: '鈴木',
            firstName: '美咲',
            phoneNumber: '090-3333-4444',
            birthDate: new Date('1995-08-20'),
            age: 29,
            nearestStation: '渋谷駅',
            university: '明治薬科大学',
            graduationYear: 2018,
            licenseYear: 2018,
            workExperienceYears: 6,
            workExperienceMonths: 0,
            workExperienceTypes: ['調剤薬局', '病院'],
            mainDuties: ['調剤', '服薬指導', '外来業務'],
            specialtyAreas: ['小児科', 'アレルギー'],
            pharmacySystems: ['調剤システムC'],
            selfIntroduction: '病院での経験を活かし、特に小児患者様への服薬指導に力を入れています。',
            verificationStatus: 'pending',
        },
    });

    // ============================================
    // 求人1（薬局1から）
    // ============================================
    console.log('📋 求人1を作成中...');
    const today = new Date();
    const workStartDate = new Date(today);
    workStartDate.setDate(today.getDate() + 14); // 2週間後
    const workEndDate = new Date(workStartDate);
    workEndDate.setDate(workStartDate.getDate() + 30); // 30日後
    const deadlineDate = new Date(today);
    deadlineDate.setDate(today.getDate() + 7); // 7日後

    const jobPosting1 = await prisma.jobPosting.create({
        data: {
            pharmacyId: pharmacy1.id,
            title: '調剤薬局での短期勤務募集（新宿）',
            workLocation: '東京都新宿区新宿1-1-1',
            description: '新宿駅から徒歩5分の調剤薬局での短期勤務を募集しています。\n\n【業務内容】\n・調剤業務\n・服薬指導\n・在庫管理\n\n【こんな方におすすめ】\n・調剤薬局での経験がある方\n・患者様とのコミュニケーションを大切にできる方\n・チームワークを大切にできる方',
            dailyWage: 25000,
            totalCompensation: 750000,
            platformFee: 300000,
            desiredWorkDays: 30,
            workStartPeriodFrom: workStartDate,
            workStartPeriodTo: workEndDate,
            recruitmentDeadline: deadlineDate,
            desiredWorkHours: '9:00-18:00',
            requirements: '調剤薬局での勤務経験2年以上、薬剤師免許',
            status: 'published',
            publishedAt: new Date(),
        },
    });

    // ============================================
    // 求人2（薬局2から）
    // ============================================
    console.log('📋 求人2を作成中...');
    const workStartDate2 = new Date(today);
    workStartDate2.setDate(today.getDate() + 21); // 3週間後
    const workEndDate2 = new Date(workStartDate2);
    workEndDate2.setDate(workStartDate2.getDate() + 45); // 45日後
    const deadlineDate2 = new Date(today);
    deadlineDate2.setDate(today.getDate() + 10); // 10日後

    const jobPosting2 = await prisma.jobPosting.create({
        data: {
            pharmacyId: pharmacy2.id,
            title: '渋谷の調剤薬局で薬剤師募集（長期可）',
            workLocation: '東京都渋谷区渋谷2-2-2',
            description: '渋谷駅から徒歩3分の調剤薬局で薬剤師を募集しています。\n\n【業務内容】\n・調剤業務全般\n・服薬指導\n・在庫管理\n・外来業務のサポート\n\n【待遇】\n・日給28,000円\n・交通費支給\n・社会保険完備（長期勤務の場合）\n\n【こんな方におすすめ】\n・調剤薬局での経験がある方\n・患者様第一を大切にできる方\n・最新のシステムを使いこなせる方',
            dailyWage: 28000,
            totalCompensation: 1260000,
            platformFee: 504000,
            desiredWorkDays: 45,
            workStartPeriodFrom: workStartDate2,
            workStartPeriodTo: workEndDate2,
            recruitmentDeadline: deadlineDate2,
            desiredWorkHours: '8:30-19:00',
            requirements: '調剤薬局での勤務経験3年以上、薬剤師免許、保険薬剤師登録',
            status: 'published',
            publishedAt: new Date(),
        },
    });

    console.log('✅ シードデータの作成が完了しました！');
    console.log('\n📝 テストアカウント情報:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('【薬局アカウント1】');
    console.log('  メール: pharmacy1@test.com');
    console.log('  パスワード: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('【薬局アカウント2】');
    console.log('  メール: pharmacy2@test.com');
    console.log('  パスワード: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('【薬剤師アカウント1】');
    console.log('  メール: pharmacist1@test.com');
    console.log('  パスワード: password123');
    console.log('  資格証明書: 確認済み');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('【薬剤師アカウント2】');
    console.log('  メール: pharmacist2@test.com');
    console.log('  パスワード: password123');
    console.log('  資格証明書: 未確認');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 作成された求人:');
    console.log(`  1. ${jobPosting1.title} (ID: ${jobPosting1.id})`);
    console.log(`  2. ${jobPosting2.title} (ID: ${jobPosting2.id})`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 変数を使用（TypeScriptエラー回避）
    console.log(`薬剤師2 ID: ${pharmacist2.id}`);
}

main()
    .catch((e) => {
        console.error('❌ シードデータの作成中にエラーが発生しました:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

