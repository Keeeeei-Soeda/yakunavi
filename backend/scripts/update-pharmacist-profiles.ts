import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 薬剤師プロフィールの更新を開始します...');

    // ============================================
    // 薬剤師1のプロフィール更新
    // ============================================
    console.log('👨‍⚕️ 薬剤師1のプロフィールを更新中...');
    const pharmacistUser1 = await prisma.user.findUnique({
        where: { email: 'pharmacist1@test.com' },
        include: { pharmacist: true },
    });

    if (pharmacistUser1 && pharmacistUser1.pharmacist) {
        await prisma.pharmacist.update({
            where: { id: pharmacistUser1.pharmacist.id },
            data: {
                // 基本情報
                lastName: '田中',
                firstName: '一郎',
                phoneNumber: '090-1111-2222',
                address: '東京都新宿区新宿1-2-3',
                birthDate: new Date('1990-05-15'),
                age: 34,
                nearestStation: '新宿駅',
                university: '東京薬科大学',
                graduationYear: 2012,

                // 資格情報
                licenseNumber: '12345678',
                licenseYear: 2012,
                certifiedPharmacistLicense: 'がん薬物療法認定薬剤師、糖尿病薬物療法認定薬剤師',
                otherLicenses: '登録販売者',

                // 経歴
                workExperienceYears: 12,
                workExperienceMonths: 3,
                workExperienceTypes: ['調剤薬局', 'ドラッグストア'],
                mainDuties: ['調剤業務', '服薬指導', '在庫管理', '在宅医療'],

                // スキル・専門分野
                specialtyAreas: ['循環器科', '糖尿病', 'がん領域'],
                pharmacySystems: ['Pharnes（ファーネス）', 'Musubi（むすび）'],
                specialNotes: '英語対応可',

                // 自己紹介
                selfIntroduction: '12年間の調剤薬局での経験を活かし、患者様に寄り添った服薬指導を心がけています。特に循環器科と糖尿病領域に強みがあり、在宅医療にも対応可能です。チームワークを大切にし、効率的な業務処理を心がけています。',

                // 本人確認ステータス
                verificationStatus: 'verified',
                verifiedAt: new Date(),
            },
        });
        console.log('✅ 薬剤師1のプロフィールを更新しました');
    } else {
        console.log('⚠️ 薬剤師1のアカウントが見つかりません');
    }

    // ============================================
    // 薬剤師2のプロフィール更新
    // ============================================
    console.log('👨‍⚕️ 薬剤師2のプロフィールを更新中...');
    const pharmacistUser2 = await prisma.user.findUnique({
        where: { email: 'pharmacist2@test.com' },
        include: { pharmacist: true },
    });

    if (pharmacistUser2 && pharmacistUser2.pharmacist) {
        await prisma.pharmacist.update({
            where: { id: pharmacistUser2.pharmacist.id },
            data: {
                // 基本情報
                lastName: '鈴木',
                firstName: '美咲',
                phoneNumber: '090-3333-4444',
                address: '東京都渋谷区渋谷2-3-4',
                birthDate: new Date('1995-08-20'),
                age: 29,
                nearestStation: '渋谷駅',
                university: '明治薬科大学',
                graduationYear: 2018,

                // 資格情報
                licenseNumber: '87654321',
                licenseYear: 2018,
                certifiedPharmacistLicense: '小児薬物療法認定薬剤師',
                otherLicenses: '栄養サポートチーム専門療法士',

                // 経歴
                workExperienceYears: 6,
                workExperienceMonths: 6,
                workExperienceTypes: ['調剤薬局', '病院薬剤部'],
                mainDuties: ['調剤業務', '服薬指導', '外来業務', 'かかりつけ薬剤師'],

                // スキル・専門分野
                specialtyAreas: ['小児科', 'アレルギー', '呼吸器科'],
                pharmacySystems: ['電子薬歴PharmaLink', 'Musubi（むすび）'],
                specialNotes: '中国語対応可',

                // 自己紹介
                selfIntroduction: '病院での経験を活かし、特に小児患者様への服薬指導に力を入れています。アレルギー領域にも詳しく、患者様とそのご家族に寄り添った対応を心がけています。最新の薬歴システムにも対応可能です。',

                // 本人確認ステータス（確認中）
                verificationStatus: 'pending',
            },
        });
        console.log('✅ 薬剤師2のプロフィールを更新しました');
    } else {
        console.log('⚠️ 薬剤師2のアカウントが見つかりません');
    }

    // ============================================
    // 証明書の確認・作成
    // ============================================
    if (pharmacistUser1 && pharmacistUser1.pharmacist) {
        // 薬剤師1の証明書を確認
        const certificates1 = await prisma.certificate.findMany({
            where: { pharmacistId: pharmacistUser1.pharmacist.id },
        });

        if (certificates1.length === 0) {
            // 証明書が存在しない場合は作成
            await prisma.certificate.create({
                data: {
                    pharmacistId: pharmacistUser1.pharmacist.id,
                    certificateType: 'license',
                    filePath: '/uploads/certificates/test-license-1.pdf',
                    fileName: '薬剤師免許証.pdf',
                    verificationStatus: 'verified',
                    verifiedAt: new Date(),
                },
            });

            await prisma.certificate.create({
                data: {
                    pharmacistId: pharmacistUser1.pharmacist.id,
                    certificateType: 'registration',
                    filePath: '/uploads/certificates/test-registration-1.pdf',
                    fileName: '保険薬剤師登録票.pdf',
                    verificationStatus: 'verified',
                    verifiedAt: new Date(),
                },
            });
            console.log('✅ 薬剤師1の証明書を作成しました');
        }
    }

    if (pharmacistUser2 && pharmacistUser2.pharmacist) {
        // 薬剤師2の証明書を確認
        const certificates2 = await prisma.certificate.findMany({
            where: { pharmacistId: pharmacistUser2.pharmacist.id },
        });

        if (certificates2.length === 0) {
            // 証明書が存在しない場合は作成
            await prisma.certificate.create({
                data: {
                    pharmacistId: pharmacistUser2.pharmacist.id,
                    certificateType: 'license',
                    filePath: '/uploads/certificates/test-license-2.pdf',
                    fileName: '薬剤師免許証.pdf',
                    verificationStatus: 'pending',
                },
            });

            await prisma.certificate.create({
                data: {
                    pharmacistId: pharmacistUser2.pharmacist.id,
                    certificateType: 'registration',
                    filePath: '/uploads/certificates/test-registration-2.pdf',
                    fileName: '保険薬剤師登録票.pdf',
                    verificationStatus: 'pending',
                },
            });
            console.log('✅ 薬剤師2の証明書を作成しました');
        }
    }

    console.log('\n✅ プロフィールの更新が完了しました！');
    console.log('\n📝 更新されたアカウント:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('【薬剤師アカウント1】');
    console.log('  メール: pharmacist1@test.com');
    console.log('  氏名: 田中 一郎');
    console.log('  資格証明書: 確認済み');
    console.log('  本人確認: 完了');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('【薬剤師アカウント2】');
    console.log('  メール: pharmacist2@test.com');
    console.log('  氏名: 鈴木 美咲');
    console.log('  資格証明書: 確認中');
    console.log('  本人確認: 確認中');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
    .catch((e) => {
        console.error('❌ プロフィールの更新中にエラーが発生しました:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

