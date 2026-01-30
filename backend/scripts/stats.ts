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

