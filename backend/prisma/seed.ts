import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 シードデータの作成を開始します...');

    // パスワードをハッシュ化（全アカウント共通: password123）
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 既存データをクリーンアップ
    console.log('🧹 既存データをクリーンアップ...');
    await prisma.application.deleteMany();
    await prisma.message.deleteMany();
    await prisma.jobPosting.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.document.deleteMany();
    await prisma.certificate.deleteMany();
    await prisma.pharmacist.deleteMany();
    await prisma.pharmacy.deleteMany();
    await prisma.user.deleteMany();

    // ============================================
    // 薬局アカウント1: 羽曳野薬局
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
            pharmacyName: '羽曳野薬局',
            representativeLastName: '山田',
            representativeFirstName: '太郎',
            phoneNumber: '072-1234-5678',
            faxNumber: '072-1234-5679',
            prefecture: '大阪府',
            address: '大阪府羽曳野市羽曳野1-2-3',
            nearestStation: '古市駅（近鉄南大阪線）',
            establishedDate: new Date('2010-04-01'),
            dailyPrescriptionCount: 80,
            staffCount: 5,
            businessHoursStart: new Date('1970-01-01T09:00:00'),
            businessHoursEnd: new Date('1970-01-01T18:00:00'),
            introduction: '地域密着型の調剤薬局です。患者様第一をモットーに、丁寧な服薬指導を心がけています。在宅医療にも対応しており、地域の皆様の健康をサポートしています。',
            strengths: '・丁寧な服薬指導\n・在宅医療対応\n・地域密着型のサービス\n・アットホームな雰囲気',
            equipmentSystems: '・電子薬歴システム（Musubi）導入済み\n・在宅医療支援システム完備',
        },
    });

    // ============================================
    // 薬局アカウント2: テスト薬局 新宿店
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
            pharmacyName: 'テスト薬局 新宿店',
            representativeLastName: '佐藤',
            representativeFirstName: '花子',
            phoneNumber: '03-1234-5678',
            faxNumber: '03-1234-5679',
            prefecture: '東京都',
            address: '東京都新宿区新宿1-1-1',
            nearestStation: '新宿駅',
            establishedDate: new Date('2015-06-01'),
            dailyPrescriptionCount: 150,
            staffCount: 8,
            businessHoursStart: new Date('1970-01-01T08:00:00'),
            businessHoursEnd: new Date('1970-01-01T20:00:00'),
            introduction: '最新の設備とシステムを導入した調剤薬局です。効率的な業務を実現し、患者様に快適なサービスを提供しています。',
            strengths: '・最新のシステム導入\n・効率的な業務処理\n・駅近でアクセス良好\n・24時間対応可能',
            equipmentSystems: '・Pharnes（ファーネス）\n・電子薬歴PharmaLink\n・自動調剤機導入',
        },
    });

    // ============================================
    // 薬局アカウント3: サンプル薬局 渋谷店
    // ============================================
    console.log('📦 薬局アカウント3を作成中...');
    const pharmacyUser3 = await prisma.user.create({
        data: {
            email: 'pharmacy3@test.com',
            password: hashedPassword,
            userType: 'pharmacy',
            emailVerified: true,
            isActive: true,
        },
    });

    const pharmacy3 = await prisma.pharmacy.create({
        data: {
            userId: pharmacyUser3.id,
            pharmacyName: 'サンプル薬局 渋谷店',
            representativeLastName: '鈴木',
            representativeFirstName: '一郎',
            phoneNumber: '03-9876-5432',
            faxNumber: '03-9876-5433',
            prefecture: '東京都',
            address: '東京都渋谷区渋谷2-2-2',
            nearestStation: '渋谷駅',
            establishedDate: new Date('2018-03-15'),
            dailyPrescriptionCount: 200,
            staffCount: 10,
            businessHoursStart: new Date('1970-01-01T09:00:00'),
            businessHoursEnd: new Date('1970-01-01T19:00:00'),
            introduction: '渋谷エリアの中心地にある調剤薬局です。若い世代から高齢者まで、幅広い患者様に対応しています。',
            strengths: '・アクセス良好（渋谷駅徒歩3分）\n・幅広い年齢層に対応\n・多言語対応可能\n・最新の薬剤情報を提供',
            equipmentSystems: '・Musubi（むすび）\n・電子薬歴PharmaLink\n・在庫管理システム',
        },
    });

    // ============================================
    // 薬剤師アカウント1: 田中 一郎（確認済み）
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
            address: '東京都新宿区新宿1-2-3',
            birthDate: new Date('1990-05-15'),
            age: 34,
            nearestStation: '新宿駅',
            university: '東京薬科大学',
            graduationYear: 2012,
            licenseNumber: '12345678',
            licenseYear: 2012,
            certifiedPharmacistLicense: 'がん薬物療法認定薬剤師、糖尿病薬物療法認定薬剤師',
            otherLicenses: '登録販売者',
            workExperienceYears: 12,
            workExperienceMonths: 3,
            workExperienceTypes: ['調剤薬局', 'ドラッグストア'],
            mainDuties: ['調剤業務', '服薬指導', '在庫管理', '在宅医療'],
            specialtyAreas: ['循環器科', '糖尿病', 'がん領域'],
            pharmacySystems: ['Pharnes（ファーネス）', 'Musubi（むすび）'],
            specialNotes: '英語対応可',
            selfIntroduction: '12年間の調剤薬局での経験を活かし、患者様に寄り添った服薬指導を心がけています。特に循環器科と糖尿病領域に強みがあり、在宅医療にも対応可能です。チームワークを大切にし、効率的な業務処理を心がけています。',
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
            verifiedAt: new Date(),
        },
    });

    await prisma.certificate.create({
        data: {
            pharmacistId: pharmacist1.id,
            certificateType: 'registration',
            filePath: '/uploads/certificates/test-registration-1.pdf',
            fileName: '保険薬剤師登録票.pdf',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
        },
    });

    // ============================================
    // 薬剤師アカウント2: 鈴木 美咲（確認中）
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
            address: '東京都渋谷区渋谷2-3-4',
            birthDate: new Date('1995-08-20'),
            age: 29,
            nearestStation: '渋谷駅',
            university: '明治薬科大学',
            graduationYear: 2018,
            licenseNumber: '87654321',
            licenseYear: 2018,
            certifiedPharmacistLicense: '小児薬物療法認定薬剤師',
            otherLicenses: '栄養サポートチーム専門療法士',
            workExperienceYears: 6,
            workExperienceMonths: 6,
            workExperienceTypes: ['調剤薬局', '病院薬剤部'],
            mainDuties: ['調剤業務', '服薬指導', '外来業務', 'かかりつけ薬剤師'],
            specialtyAreas: ['小児科', 'アレルギー', '呼吸器科'],
            pharmacySystems: ['電子薬歴PharmaLink', 'Musubi（むすび）'],
            specialNotes: '中国語対応可',
            selfIntroduction: '病院での経験を活かし、特に小児患者様への服薬指導に力を入れています。アレルギー領域にも詳しく、患者様とそのご家族に寄り添った対応を心がけています。最新の薬歴システムにも対応可能です。',
            verificationStatus: 'pending',
        },
    });

    // 薬剤師2の証明書（確認中）
    await prisma.certificate.create({
        data: {
            pharmacistId: pharmacist2.id,
            certificateType: 'license',
            filePath: '/uploads/certificates/test-license-2.pdf',
            fileName: '薬剤師免許証.pdf',
            verificationStatus: 'pending',
        },
    });

    await prisma.certificate.create({
        data: {
            pharmacistId: pharmacist2.id,
            certificateType: 'registration',
            filePath: '/uploads/certificates/test-registration-2.pdf',
            fileName: '保険薬剤師登録票.pdf',
            verificationStatus: 'pending',
        },
    });

    // ============================================
    // 薬剤師アカウント3: 佐藤 健太（確認済み）
    // ============================================
    console.log('👨‍⚕️ 薬剤師アカウント3を作成中...');
    const pharmacistUser3 = await prisma.user.create({
        data: {
            email: 'pharmacist3@test.com',
            password: hashedPassword,
            userType: 'pharmacist',
            emailVerified: true,
            isActive: true,
        },
    });

    const pharmacist3 = await prisma.pharmacist.create({
        data: {
            userId: pharmacistUser3.id,
            lastName: '佐藤',
            firstName: '健太',
            phoneNumber: '090-5555-6666',
            address: '大阪府大阪市天王寺区1-1-1',
            birthDate: new Date('1988-03-10'),
            age: 36,
            nearestStation: '天王寺駅',
            university: '大阪薬科大学',
            graduationYear: 2010,
            licenseNumber: '11223344',
            licenseYear: 2010,
            certifiedPharmacistLicense: '在宅療養支援薬剤師、がん薬物療法認定薬剤師',
            otherLicenses: '登録販売者、栄養サポートチーム専門療法士',
            workExperienceYears: 14,
            workExperienceMonths: 8,
            workExperienceTypes: ['調剤薬局', '病院薬剤部', 'ドラッグストア'],
            mainDuties: ['調剤業務', '服薬指導', '在宅医療', 'かかりつけ薬剤師', 'OTC販売'],
            specialtyAreas: ['在宅医療', 'がん領域', '緩和ケア'],
            pharmacySystems: ['Pharnes（ファーネス）', 'Musubi（むすび）', '電子薬歴PharmaLink'],
            specialNotes: '在宅医療に精通、24時間対応可能',
            selfIntroduction: '14年以上の経験を持ち、特に在宅医療とがん領域に強みがあります。患者様とそのご家族に寄り添い、最適な薬物療法を提案します。緩和ケアにも対応可能で、多職種連携を大切にしています。',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
        },
    });

    // 薬剤師3の証明書
    await prisma.certificate.create({
        data: {
            pharmacistId: pharmacist3.id,
            certificateType: 'license',
            filePath: '/uploads/certificates/test-license-3.pdf',
            fileName: '薬剤師免許証.pdf',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
        },
    });

    await prisma.certificate.create({
        data: {
            pharmacistId: pharmacist3.id,
            certificateType: 'registration',
            filePath: '/uploads/certificates/test-registration-3.pdf',
            fileName: '保険薬剤師登録票.pdf',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
        },
    });

    // ============================================
    // 薬剤師アカウント4: 山本 さくら（確認済み）
    // ============================================
    console.log('👨‍⚕️ 薬剤師アカウント4を作成中...');
    const pharmacistUser4 = await prisma.user.create({
        data: {
            email: 'pharmacist4@test.com',
            password: hashedPassword,
            userType: 'pharmacist',
            emailVerified: true,
            isActive: true,
        },
    });

    const pharmacist4 = await prisma.pharmacist.create({
        data: {
            userId: pharmacistUser4.id,
            lastName: '山本',
            firstName: 'さくら',
            phoneNumber: '090-7777-8888',
            address: '東京都世田谷区世田谷1-1-1',
            birthDate: new Date('1992-11-25'),
            age: 32,
            nearestStation: '下北沢駅',
            university: '星薬科大学',
            graduationYear: 2015,
            licenseNumber: '55667788',
            licenseYear: 2015,
            certifiedPharmacistLicense: '糖尿病薬物療法認定薬剤師',
            otherLicenses: '登録販売者',
            workExperienceYears: 9,
            workExperienceMonths: 2,
            workExperienceTypes: ['調剤薬局', 'ドラッグストア'],
            mainDuties: ['調剤業務', '服薬指導', 'OTC販売', '在庫管理'],
            specialtyAreas: ['糖尿病', '生活習慣病', '婦人科'],
            pharmacySystems: ['Pharnes（ファーネス）', 'Musubi（むすび）'],
            specialNotes: '女性の健康相談にも対応',
            selfIntroduction: '9年間の調剤薬局での経験を活かし、特に糖尿病や生活習慣病の患者様への服薬指導に力を入れています。女性の健康相談にも対応可能で、患者様に寄り添った丁寧な対応を心がけています。',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
        },
    });

    // 薬剤師4の証明書
    await prisma.certificate.create({
        data: {
            pharmacistId: pharmacist4.id,
            certificateType: 'license',
            filePath: '/uploads/certificates/test-license-4.pdf',
            fileName: '薬剤師免許証.pdf',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
        },
    });

    await prisma.certificate.create({
        data: {
            pharmacistId: pharmacist4.id,
            certificateType: 'registration',
            filePath: '/uploads/certificates/test-registration-4.pdf',
            fileName: '保険薬剤師登録票.pdf',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
        },
    });

    // ============================================
    // 薬剤師アカウント5: 中村 大輔（確認済み）
    // ============================================
    console.log('👨‍⚕️ 薬剤師アカウント5を作成中...');
    const pharmacistUser5 = await prisma.user.create({
        data: {
            email: 'pharmacist5@test.com',
            password: hashedPassword,
            userType: 'pharmacist',
            emailVerified: true,
            isActive: true,
        },
    });

    const pharmacist5 = await prisma.pharmacist.create({
        data: {
            userId: pharmacistUser5.id,
            lastName: '中村',
            firstName: '大輔',
            phoneNumber: '090-9999-0000',
            address: '神奈川県横浜市港北区1-1-1',
            birthDate: new Date('1987-07-08'),
            age: 37,
            nearestStation: '横浜駅',
            university: '横浜薬科大学',
            graduationYear: 2009,
            licenseNumber: '99887766',
            licenseYear: 2009,
            certifiedPharmacistLicense: 'がん薬物療法認定薬剤師、在宅療養支援薬剤師',
            otherLicenses: '登録販売者、栄養サポートチーム専門療法士',
            workExperienceYears: 15,
            workExperienceMonths: 4,
            workExperienceTypes: ['調剤薬局', '病院薬剤部', '製薬企業'],
            mainDuties: ['調剤業務', '服薬指導', '在宅医療', 'かかりつけ薬剤師', '薬物療法管理'],
            specialtyAreas: ['がん領域', '在宅医療', '緩和ケア', '感染症'],
            pharmacySystems: ['Pharnes（ファーネス）', 'Musubi（むすび）', '電子薬歴PharmaLink'],
            specialNotes: '製薬企業での経験あり、最新の薬剤情報に精通',
            selfIntroduction: '15年以上の経験を持ち、調剤薬局、病院、製薬企業での幅広い経験があります。特にがん領域と在宅医療に強みがあり、最新の薬剤情報を活用した服薬指導を行います。多職種連携を大切にし、患者様中心の医療を提供します。',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
        },
    });

    // 薬剤師5の証明書
    await prisma.certificate.create({
        data: {
            pharmacistId: pharmacist5.id,
            certificateType: 'license',
            filePath: '/uploads/certificates/test-license-5.pdf',
            fileName: '薬剤師免許証.pdf',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
        },
    });

    await prisma.certificate.create({
        data: {
            pharmacistId: pharmacist5.id,
            certificateType: 'registration',
            filePath: '/uploads/certificates/test-registration-5.pdf',
            fileName: '保険薬剤師登録票.pdf',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
        },
    });

    // ============================================
    // 求人作成
    // ============================================
    const today = new Date();

    // 求人001: 羽曳野薬局 - 急募! 大阪で働ける人募集
    console.log('📋 求人001を作成中...');
    const workStartDate1 = new Date(today);
    workStartDate1.setDate(today.getDate() + 14);
    const workEndDate1 = new Date(workStartDate1);
    workEndDate1.setDate(workStartDate1.getDate() + 30);
    const deadlineDate1 = new Date(today);
    deadlineDate1.setDate(today.getDate() + 7);

    const jobPosting1 = await prisma.jobPosting.create({
        data: {
            pharmacyId: pharmacy1.id,
            title: '急募! 大阪で働ける人募集',
            workLocation: '大阪府羽曳野市羽曳野1-2-3',
            description: '一緒にやりましょう\n\n【業務内容】\n・調剤業務\n・服薬指導\n・在庫管理\n\n【こんな方におすすめ】\n・調剤薬局での経験がある方\n・患者様とのコミュニケーションを大切にできる方\n・チームワークを大切にできる方',
            dailyWage: 25000,
            totalCompensation: 750000,
            platformFee: 300000,
            desiredWorkDays: 30,
            workStartPeriodFrom: workStartDate1,
            workStartPeriodTo: workEndDate1,
            recruitmentDeadline: deadlineDate1,
            desiredWorkHours: '9:00-18:00（目安・相談可）',
            requirements: '応募条件：特に指定なし',
            status: 'published',
            publishedAt: new Date(),
        },
    });

    // 求人002: テスト薬局 新宿店 - 新宿駅前の調剤薬局で薬剤師募集
    console.log('📋 求人002を作成中...');
    const workStartDate2 = new Date(today);
    workStartDate2.setDate(today.getDate() + 21);
    const workEndDate2 = new Date(workStartDate2);
    workEndDate2.setDate(workStartDate2.getDate() + 20);
    const deadlineDate2 = new Date(today);
    deadlineDate2.setDate(today.getDate() + 10);

    const jobPosting2 = await prisma.jobPosting.create({
        data: {
            pharmacyId: pharmacy2.id,
            title: '新宿駅前の調剤薬局で薬剤師募集',
            workLocation: '東京都新宿区新宿3-3-3',
            description: '新宿駅南口から徒歩3分の好立地調剤薬局で薬剤師を募集しています。\n\n【業務内容】\n・調剤業務全般\n・服薬指導\n・在庫管理\n・レセプト業務\n\n【待遇】\n・日給26,000円\n・交通費全額支給\n・残業手当あり\n\n【こんな方におすすめ】\n・調剤薬局での経験がある方\n・効率的な業務処理ができる方\n・患者様に寄り添った対応ができる方',
            dailyWage: 26000,
            totalCompensation: 520000,
            platformFee: 208000,
            desiredWorkDays: 20,
            workStartPeriodFrom: workStartDate2,
            workStartPeriodTo: workEndDate2,
            recruitmentDeadline: deadlineDate2,
            desiredWorkHours: '8:00-17:00',
            requirements: '調剤薬局での勤務経験1年以上、薬剤師免許',
            status: 'published',
            publishedAt: new Date(),
        },
    });

    // 求人003: テスト薬局 新宿店 - 新宿エリアの調剤薬局で長期勤務募集
    console.log('📋 求人003を作成中...');
    const workStartDate3 = new Date(today);
    workStartDate3.setDate(today.getDate() + 28);
    const workEndDate3 = new Date(workStartDate3);
    workEndDate3.setDate(workStartDate3.getDate() + 60);
    const deadlineDate3 = new Date(today);
    deadlineDate3.setDate(today.getDate() + 14);

    const jobPosting3 = await prisma.jobPosting.create({
        data: {
            pharmacyId: pharmacy2.id,
            title: '新宿エリアの調剤薬局で長期勤務募集',
            workLocation: '東京都新宿区新宿5-5-5',
            description: '新宿エリアの調剤薬局で長期勤務を募集しています。\n\n【業務内容】\n・調剤業務全般\n・服薬指導\n・在庫管理\n・レセプト業務\n・外来業務のサポート\n\n【待遇】\n・日給27,000円\n・交通費全額支給\n・社会保険完備（長期勤務の場合）\n・賞与あり（長期勤務の場合）\n\n【こんな方におすすめ】\n・調剤薬局での経験が豊富な方\n・長期的に勤務できる方\n・チームリーダーとして活躍したい方',
            dailyWage: 27000,
            totalCompensation: 1620000,
            platformFee: 648000,
            desiredWorkDays: 60,
            workStartPeriodFrom: workStartDate3,
            workStartPeriodTo: workEndDate3,
            recruitmentDeadline: deadlineDate3,
            desiredWorkHours: '9:00-18:00',
            requirements: '調剤薬局での勤務経験3年以上、薬剤師免許、保険薬剤師登録',
            status: 'published',
            publishedAt: new Date(),
        },
    });

    // 求人004: サンプル薬局 渋谷店 - 渋谷の調剤薬局で薬剤師募集（長期可）
    console.log('📋 求人004を作成中...');
    const workStartDate4 = new Date(today);
    workStartDate4.setDate(today.getDate() + 14);
    const workEndDate4 = new Date(workStartDate4);
    workEndDate4.setDate(workStartDate4.getDate() + 45);
    const deadlineDate4 = new Date(today);
    deadlineDate4.setDate(today.getDate() + 7);

    const jobPosting4 = await prisma.jobPosting.create({
        data: {
            pharmacyId: pharmacy3.id,
            title: '渋谷の調剤薬局で薬剤師募集（長期可）',
            workLocation: '東京都渋谷区渋谷2-2-2',
            description: '渋谷駅から徒歩3分の調剤薬局で薬剤師を募集しています。\n\n【業務内容】\n・調剤業務全般\n・服薬指導\n・在庫管理\n・外来業務のサポート\n\n【待遇】\n・日給28,000円\n・交通費支給\n・社会保険完備（長期勤務の場合）\n\n【こんな方におすすめ】\n・調剤薬局での経験がある方\n・患者様第一を大切にできる方\n・最新のシステムを使いこなせる方',
            dailyWage: 28000,
            totalCompensation: 1260000,
            platformFee: 504000,
            desiredWorkDays: 45,
            workStartPeriodFrom: workStartDate4,
            workStartPeriodTo: workEndDate4,
            recruitmentDeadline: deadlineDate4,
            desiredWorkHours: '8:30-19:00',
            requirements: '調剤薬局での勤務経験3年以上、薬剤師免許、保険薬剤師登録',
            status: 'published',
            publishedAt: new Date(),
        },
    });

    // 求人005: サンプル薬局 渋谷店 - 渋谷エリアの調剤薬局で薬剤師募集
    console.log('📋 求人005を作成中...');
    const workStartDate5 = new Date(today);
    workStartDate5.setDate(today.getDate() + 21);
    const workEndDate5 = new Date(workStartDate5);
    workEndDate5.setDate(workStartDate5.getDate() + 35);
    const deadlineDate5 = new Date(today);
    deadlineDate5.setDate(today.getDate() + 12);

    const jobPosting5 = await prisma.jobPosting.create({
        data: {
            pharmacyId: pharmacy3.id,
            title: '渋谷エリアの調剤薬局で薬剤師募集',
            workLocation: '東京都渋谷区渋谷4-4-4',
            description: '渋谷エリアの調剤薬局で薬剤師を募集しています。\n\n【業務内容】\n・調剤業務全般\n・服薬指導\n・在庫管理\n・レセプト業務\n・外来業務のサポート\n\n【待遇】\n・日給29,000円\n・交通費全額支給\n・残業手当あり\n・社会保険完備（長期勤務の場合）\n\n【こんな方におすすめ】\n・調剤薬局での経験が豊富な方\n・効率的な業務処理ができる方\n・患者様に寄り添った対応ができる方\n・最新のシステムを使いこなせる方',
            dailyWage: 29000,
            totalCompensation: 1015000,
            platformFee: 406000,
            desiredWorkDays: 35,
            workStartPeriodFrom: workStartDate5,
            workStartPeriodTo: workEndDate5,
            recruitmentDeadline: deadlineDate5,
            desiredWorkHours: '9:00-18:00',
            requirements: '調剤薬局での勤務経験2年以上、薬剤師免許、保険薬剤師登録',
            status: 'published',
            publishedAt: new Date(),
        },
    });

    // ============================================
    // 応募データ作成（テスト用）
    // ============================================
    console.log('📝 応募データを作成中...');

    // 薬剤師1が求人1に応募
    const application1 = await prisma.application.create({
        data: {
            jobPostingId: jobPosting1.id,
            pharmacistId: pharmacist1.id,
            status: 'applied',
            coverLetter: 'よろしくお願いいたします',
            nearestStation: '新宿駅',
            appliedAt: new Date(),
        },
    });

    // 薬剤師3が求人1に応募
    const application2 = await prisma.application.create({
        data: {
            jobPostingId: jobPosting1.id,
            pharmacistId: pharmacist3.id,
            status: 'applied',
            coverLetter: '在宅医療の経験を活かして貢献したいと考えております。よろしくお願いいたします。',
            nearestStation: '天王寺駅',
            appliedAt: new Date(),
        },
    });

    // 薬剤師4が求人2に応募
    const application3 = await prisma.application.create({
        data: {
            jobPostingId: jobPosting2.id,
            pharmacistId: pharmacist4.id,
            status: 'applied',
            coverLetter: '糖尿病領域での経験を活かして、患者様に寄り添った服薬指導を行いたいと考えております。',
            nearestStation: '下北沢駅',
            appliedAt: new Date(),
        },
    });

    // ============================================
    // 完了メッセージ
    // ============================================
    console.log('\n✅ シードデータの作成が完了しました！');
    console.log('\n📝 テストアカウント情報:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('【薬局アカウント】');
    console.log('  1. pharmacy1@test.com (羽曳野薬局) - パスワード: password123');
    console.log('  2. pharmacy2@test.com (テスト薬局 新宿店) - パスワード: password123');
    console.log('  3. pharmacy3@test.com (サンプル薬局 渋谷店) - パスワード: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('【薬剤師アカウント】');
    console.log('  1. pharmacist1@test.com (田中 一郎) - パスワード: password123 - 資格証明書: 確認済み');
    console.log('  2. pharmacist2@test.com (鈴木 美咲) - パスワード: password123 - 資格証明書: 確認中');
    console.log('  3. pharmacist3@test.com (佐藤 健太) - パスワード: password123 - 資格証明書: 確認済み');
    console.log('  4. pharmacist4@test.com (山本 さくら) - パスワード: password123 - 資格証明書: 確認済み');
    console.log('  5. pharmacist5@test.com (中村 大輔) - パスワード: password123 - 資格証明書: 確認済み');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 作成された求人:');
    console.log(`  001. ${jobPosting1.title} (ID: ${jobPosting1.id})`);
    console.log(`  002. ${jobPosting2.title} (ID: ${jobPosting2.id})`);
    console.log(`  003. ${jobPosting3.title} (ID: ${jobPosting3.id})`);
    console.log(`  004. ${jobPosting4.title} (ID: ${jobPosting4.id})`);
    console.log(`  005. ${jobPosting5.title} (ID: ${jobPosting5.id})`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 作成された応募:');
    console.log(`  ・薬剤師1 (田中 一郎) → 求人1 (${jobPosting1.title})`);
    console.log(`  ・薬剤師3 (佐藤 健太) → 求人1 (${jobPosting1.title})`);
    console.log(`  ・薬剤師4 (山本 さくら) → 求人2 (${jobPosting2.title})`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
    .catch((e) => {
        console.error('❌ シードデータの作成中にエラーが発生しました:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
