import prisma from '../src/utils/prisma';

// 削除対象ID
const PHARMACY_IDS_TO_DELETE = [5n, 6n, 7n, 12n, 13n, 14n, 15n];
const PHARMACIST_IDS_TO_DELETE = [5n, 6n, 7n, 13n, 14n, 16n, 18n, 19n, 20n];

async function deleteDummyData() {
    console.log('🗑️  ダミーデータ削除を開始します...');

    // ---- 事前情報収集 ----
    const pharmacyUserIds = (await prisma.pharmacy.findMany({
        where: { id: { in: PHARMACY_IDS_TO_DELETE } },
        select: { userId: true },
    })).map((p) => p.userId);

    const pharmacistUserIds = (await prisma.pharmacist.findMany({
        where: { id: { in: PHARMACIST_IDS_TO_DELETE } },
        select: { userId: true },
    })).map((p) => p.userId);

    const jobPostingIds = (await prisma.jobPosting.findMany({
        where: { pharmacyId: { in: PHARMACY_IDS_TO_DELETE } },
        select: { id: true },
    })).map((j) => j.id);

    const applicationIds = (await prisma.application.findMany({
        where: {
            OR: [
                { jobPostingId: { in: jobPostingIds } },
                { pharmacistId: { in: PHARMACIST_IDS_TO_DELETE } },
            ],
        },
        select: { id: true },
    })).map((a) => a.id);

    const contractIds = (await prisma.contract.findMany({
        where: {
            OR: [
                { pharmacyId: { in: PHARMACY_IDS_TO_DELETE } },
                { pharmacistId: { in: PHARMACIST_IDS_TO_DELETE } },
            ],
        },
        select: { id: true },
    })).map((c) => c.id);

    console.log(`  薬局: ${PHARMACY_IDS_TO_DELETE.length}件`);
    console.log(`  薬剤師: ${PHARMACIST_IDS_TO_DELETE.length}件`);
    console.log(`  求人: ${jobPostingIds.length}件`);
    console.log(`  応募: ${applicationIds.length}件`);
    console.log(`  契約: ${contractIds.length}件`);

    // ---- 削除（依存順） ----

    console.log('\n[1/11] 通知を削除...');
    const n1 = await prisma.notification.deleteMany({
        where: { userId: { in: [...pharmacyUserIds, ...pharmacistUserIds] } },
    });
    console.log(`  → ${n1.count}件`);

    console.log('[2/11] お気に入りを削除...');
    const n2 = await prisma.favoriteJob.deleteMany({
        where: { pharmacistId: { in: PHARMACIST_IDS_TO_DELETE } },
    });
    console.log(`  → ${n2.count}件`);

    console.log('[3/11] メッセージを削除...');
    const n3 = await prisma.message.deleteMany({
        where: { applicationId: { in: applicationIds } },
    });
    console.log(`  → ${n3.count}件`);

    console.log('[4/11] 書類を削除...');
    const n4 = await prisma.document.deleteMany({
        where: {
            OR: [
                { contractId: { in: contractIds } },
                { pharmacyId: { in: PHARMACY_IDS_TO_DELETE } },
                { pharmacistId: { in: PHARMACIST_IDS_TO_DELETE } },
            ],
        },
    });
    console.log(`  → ${n4.count}件`);

    console.log('[5/11] 支払いを削除...');
    const n5 = await prisma.payment.deleteMany({
        where: {
            OR: [
                { contractId: { in: contractIds } },
                { pharmacyId: { in: PHARMACY_IDS_TO_DELETE } },
            ],
        },
    });
    console.log(`  → ${n5.count}件`);

    console.log('[6/11] ペナルティを削除...');
    const n6 = await prisma.penalty.deleteMany({
        where: { pharmacyId: { in: PHARMACY_IDS_TO_DELETE } },
    });
    console.log(`  → ${n6.count}件`);

    console.log('[7/11] 契約を削除...');
    const n7 = await prisma.contract.deleteMany({
        where: { id: { in: contractIds } },
    });
    console.log(`  → ${n7.count}件`);

    console.log('[8/11] 応募を削除...');
    const n8 = await prisma.application.deleteMany({
        where: { id: { in: applicationIds } },
    });
    console.log(`  → ${n8.count}件`);

    console.log('[9/11] 求人を削除...');
    const n9 = await prisma.jobPosting.deleteMany({
        where: { pharmacyId: { in: PHARMACY_IDS_TO_DELETE } },
    });
    console.log(`  → ${n9.count}件`);

    console.log('[10/11] 証明書・薬剤師・支店・薬局を削除...');
    const nc = await prisma.certificate.deleteMany({
        where: { pharmacistId: { in: PHARMACIST_IDS_TO_DELETE } },
    });
    const nb = await prisma.pharmacyBranch.deleteMany({
        where: { pharmacyId: { in: PHARMACY_IDS_TO_DELETE } },
    });
    const npa = await prisma.pharmacist.deleteMany({
        where: { id: { in: PHARMACIST_IDS_TO_DELETE } },
    });
    const nph = await prisma.pharmacy.deleteMany({
        where: { id: { in: PHARMACY_IDS_TO_DELETE } },
    });
    console.log(`  証明書 ${nc.count}件 / 支店 ${nb.count}件 / 薬剤師 ${npa.count}件 / 薬局 ${nph.count}件`);

    console.log('[11/11] ユーザーを削除...');
    const n11 = await prisma.user.deleteMany({
        where: { id: { in: [...pharmacyUserIds, ...pharmacistUserIds] } },
    });
    console.log(`  → ${n11.count}件`);

    console.log('\n✅ ダミーデータ削除完了');
}

deleteDummyData()
    .catch((e) => {
        console.error('❌ 削除中にエラーが発生しました:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
