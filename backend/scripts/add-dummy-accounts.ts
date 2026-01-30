import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function addDummyAccounts() {
    console.log('🌱 ダミーアカウントの追加を開始します...');
    console.log('⚠️  注意: 既存データは削除されません。新規アカウントのみ追加します。');

    // パスワードをハッシュ化（全アカウント共通: password123）
    const hashedPassword = await bcrypt.hash('password123', 10);

    const prefectures = [
        '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
        '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
        '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
        '岐阜県', '静岡県', '愛知県', '三重県',
        '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
        '鳥取県', '島根県', '岡山県', '広島県', '山口県',
        '徳島県', '香川県', '愛媛県', '高知県',
        '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
    ];

    const pharmacyNames = [
        'さくら薬局', 'すみれ薬局', 'ひまわり薬局', 'コスモス薬局', 'あおば薬局',
        'みどり薬局', 'つばき薬局', 'もみじ薬局', 'かえで薬局', 'なでしこ薬局'
    ];

    const areas = [
        '駅前店', '中央店', '本店', '北口店', '南口店', '東店', '西店', '新店', '駅ビル店', '商店街店'
    ];

    const lastNames = [
        '佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤',
        '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '斎藤', '清水'
    ];

    const firstNamesMale = [
        '太郎', '次郎', '三郎', '健太', '大輔', '翔太', '拓也', '雄一', '誠', '隆',
        '浩二', '和也', '智也', '直樹', '勇気', '貴史', '正樹', '哲也', '俊介', '康平'
    ];

    const firstNamesFemale = [
        '花子', '美咲', 'さくら', '陽子', '由美', '真理', '恵子', '裕子', '明美', '智子',
        '愛', '結衣', '葵', '優奈', '美優', '莉子', '彩香', '七海', '美月', '桜'
    ];

    const universities = [
        '東京薬科大学', '明治薬科大学', '昭和薬科大学', '北里大学', '慶應義塾大学',
        '東京理科大学', '星薬科大学', '帝京大学', '日本大学', '城西大学',
        '千葉科学大学', '横浜薬科大学', '新潟薬科大学', '金沢大学', '名城大学',
        '京都薬科大学', '大阪薬科大学', '神戸薬科大学', '広島大学', '福岡大学'
    ];

    const workExperienceTypesList = [
        ['調剤薬局'],
        ['調剤薬局', 'ドラッグストア'],
        ['病院薬剤部'],
        ['調剤薬局', '病院薬剤部'],
        ['ドラッグストア'],
        ['調剤薬局', '在宅医療'],
        ['病院薬剤部', '調剤薬局']
    ];

    const mainDutiesList = [
        ['調剤業務', '服薬指導', '在庫管理'],
        ['調剤業務', '服薬指導', '在宅医療'],
        ['調剤業務', '服薬指導', '薬歴管理', '在庫管理'],
        ['調剤業務', '服薬指導', '一般用医薬品販売'],
        ['調剤業務', '服薬指導', '薬歴管理'],
        ['調剤業務', '服薬指導', '在宅医療', '在庫管理']
    ];

    const specialtyAreasList = [
        ['循環器科', '糖尿病'],
        ['小児科', 'アレルギー'],
        ['がん領域', '緩和ケア'],
        ['精神科', '心療内科'],
        ['整形外科', 'リウマチ'],
        ['皮膚科', 'アレルギー'],
        ['消化器科', '肝臓病'],
        ['呼吸器科', '感染症'],
        ['内分泌科', '糖尿病'],
        ['腎臓内科', '透析']
    ];

    const pharmacySystemsList = [
        ['Pharnes（ファーネス）', 'Musubi（むすび）'],
        ['電子薬歴PharmaLink'],
        ['Musubi（むすび）'],
        ['Pharnes（ファーネス）'],
        ['電子薬歴PharmaLink', 'Musubi（むすび）'],
        ['薬樹薬局システム']
    ];

    const certifiedLicenses = [
        'がん薬物療法認定薬剤師',
        '糖尿病薬物療法認定薬剤師',
        '小児薬物療法認定薬剤師',
        '精神科薬物療法認定薬剤師',
        '感染制御認定薬剤師',
        '緩和薬物療法認定薬剤師',
        '腎臓病薬物療法認定薬剤師',
        '妊婦・授乳婦薬物療法認定薬剤師',
        '漢方薬・生薬認定薬剤師',
        'スポーツファーマシスト'
    ];

    // ============================================
    // 薬局アカウント10件を追加
    // ============================================
    const pharmacies = [];
    for (let i = 1; i <= 10; i++) {
        const prefecture = prefectures[Math.floor(Math.random() * prefectures.length)];
        const pharmacyName = `${pharmacyNames[i - 1]} ${areas[i - 1]}`;
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const firstName = Math.random() > 0.5 
            ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]
            : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];

        console.log(`📦 薬局アカウント${i}を作成中: ${pharmacyName}...`);

        // メールアドレスの重複チェック
        const email = `pharmacy.dummy${i}@test.com`;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        
        if (existingUser) {
            console.log(`⚠️  ${email} は既に存在します。スキップします。`);
            continue;
        }

        const pharmacyUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                userType: 'pharmacy',
                emailVerified: true,
                isActive: true,
            },
        });

        const pharmacy = await prisma.pharmacy.create({
            data: {
                userId: pharmacyUser.id,
                pharmacyName,
                representativeLastName: lastName,
                representativeFirstName: firstName,
                phoneNumber: `0${Math.floor(Math.random() * 9) + 1}0-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
                faxNumber: `0${Math.floor(Math.random() * 9) + 1}0-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
                prefecture,
                address: `${prefecture}${['中央区', '北区', '南区', '東区', '西区'][Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 5) + 1}-${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 20) + 1}`,
                nearestStation: `${['中央', '北', '南', '東', '西'][Math.floor(Math.random() * 5)]}駅`,
                establishedDate: new Date(2000 + Math.floor(Math.random() * 24), Math.floor(Math.random() * 12), 1),
                dailyPrescriptionCount: Math.floor(Math.random() * 150) + 50,
                staffCount: Math.floor(Math.random() * 10) + 3,
                businessHoursStart: new Date('1970-01-01T09:00:00'),
                businessHoursEnd: new Date('1970-01-01T18:00:00'),
                introduction: `${prefecture}の地域密着型調剤薬局です。患者様第一をモットーに、丁寧な服薬指導を心がけています。`,
                strengths: '・丁寧な服薬指導\n・地域密着型のサービス\n・アットホームな雰囲気',
                equipmentSystems: '・電子薬歴システム導入済み\n・在庫管理システム完備',
            },
        });

        pharmacies.push(pharmacy);

        // 求人を1-2件作成
        const jobCount = Math.floor(Math.random() * 2) + 1;
        for (let j = 0; j < jobCount; j++) {
            await prisma.jobPosting.create({
                data: {
                    pharmacyId: pharmacy.id,
                    title: j === 0 ? '調剤薬剤師募集' : '在宅医療対応薬剤師募集',
                    workLocation: pharmacy.address,
                    nearestStation: pharmacy.nearestStation,
                    employmentType: Math.random() > 0.5 ? '派遣' : '業務委託',
                    desiredWorkDays: Math.floor(Math.random() * 3) + 1,
                    workHours: '9:00～18:00（休憩1時間）',
                    dailyWage: Math.floor(Math.random() * 10000) + 15000,
                    transportationExpenses: '全額支給',
                    parkingAvailable: Math.random() > 0.5,
                    jobDescription: '調剤業務全般をお願いします。',
                    requiredSkills: '薬剤師免許必須',
                    preferredSkills: '調剤経験者優遇',
                    status: 'published',
                },
            });
        }
    }

    console.log(`✅ ${pharmacies.length}件の薬局アカウントを作成しました。`);

    // ============================================
    // 薬剤師アカウント10件を追加
    // ============================================
    const pharmacists = [];
    for (let i = 1; i <= 10; i++) {
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const isMale = Math.random() > 0.5;
        const firstName = isMale
            ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]
            : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
        
        const university = universities[Math.floor(Math.random() * universities.length)];
        const graduationYear = 2000 + Math.floor(Math.random() * 20);
        const age = new Date().getFullYear() - graduationYear + 22;
        const workYears = new Date().getFullYear() - graduationYear;
        const workMonths = Math.floor(Math.random() * 12);

        console.log(`👨‍⚕️ 薬剤師アカウント${i}を作成中: ${lastName} ${firstName}...`);

        // メールアドレスの重複チェック
        const email = `pharmacist.dummy${i}@test.com`;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        
        if (existingUser) {
            console.log(`⚠️  ${email} は既に存在します。スキップします。`);
            continue;
        }

        const pharmacistUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                userType: 'pharmacist',
                emailVerified: true,
                isActive: true,
            },
        });

        const workExperienceTypes = workExperienceTypesList[Math.floor(Math.random() * workExperienceTypesList.length)];
        const mainDuties = mainDutiesList[Math.floor(Math.random() * mainDutiesList.length)];
        const specialtyAreas = specialtyAreasList[Math.floor(Math.random() * specialtyAreasList.length)];
        const pharmacySystems = pharmacySystemsList[Math.floor(Math.random() * pharmacySystemsList.length)];
        const certifiedLicense = Math.random() > 0.5 ? certifiedLicenses[Math.floor(Math.random() * certifiedLicenses.length)] : null;

        const pharmacist = await prisma.pharmacist.create({
            data: {
                userId: pharmacistUser.id,
                lastName,
                firstName,
                phoneNumber: `090-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
                address: `${prefectures[Math.floor(Math.random() * prefectures.length)]}${['中央区', '北区', '南区'][Math.floor(Math.random() * 3)]}${Math.floor(Math.random() * 5) + 1}-${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 20) + 1}`,
                birthDate: new Date(1970 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                age,
                nearestStation: `${['中央', '北', '南', '東', '西'][Math.floor(Math.random() * 5)]}駅`,
                university,
                graduationYear,
                licenseNumber: `${Math.floor(Math.random() * 90000000) + 10000000}`,
                licenseYear: graduationYear,
                certifiedPharmacistLicense: certifiedLicense,
                otherLicenses: Math.random() > 0.7 ? '登録販売者' : null,
                workExperienceYears: workYears,
                workExperienceMonths: workMonths,
                workExperienceTypes,
                mainDuties,
                specialtyAreas,
                pharmacySystems,
                specialNotes: Math.random() > 0.8 ? '英語対応可' : null,
                selfIntroduction: `${workYears}年間の${workExperienceTypes.join('・')}での経験を活かし、患者様に寄り添った服薬指導を心がけています。特に${specialtyAreas.join('と')}に強みがあります。`,
                verificationStatus: Math.random() > 0.3 ? 'verified' : 'pending',
                verifiedAt: Math.random() > 0.3 ? new Date() : null,
            },
        });

        pharmacists.push(pharmacist);

        // 証明書を作成（確認済みの場合）
        if (pharmacist.verificationStatus === 'verified') {
            await prisma.certificate.create({
                data: {
                    pharmacistId: pharmacist.id,
                    certificateType: 'license',
                    filePath: `/uploads/certificates/dummy-license-${i}.pdf`,
                    fileName: '薬剤師免許証.pdf',
                    verificationStatus: 'verified',
                    verifiedAt: new Date(),
                },
            });

            await prisma.certificate.create({
                data: {
                    pharmacistId: pharmacist.id,
                    certificateType: 'registration',
                    filePath: `/uploads/certificates/dummy-registration-${i}.pdf`,
                    fileName: '保険薬剤師登録票.pdf',
                    verificationStatus: 'verified',
                    verifiedAt: new Date(),
                },
            });
        }
    }

    console.log(`✅ ${pharmacists.length}件の薬剤師アカウントを作成しました。`);

    console.log('\n🎉 ダミーアカウントの追加が完了しました！');
    console.log(`📊 追加されたアカウント:`);
    console.log(`   - 薬局: ${pharmacies.length}件`);
    console.log(`   - 薬剤師: ${pharmacists.length}件`);
    console.log(`\n🔑 すべてのアカウントのパスワード: password123`);
}

addDummyAccounts()
    .catch((error) => {
        console.error('❌ エラーが発生しました:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

