import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏥 既存薬局データをPharmacyBranchに移行します...');

  const pharmacies = await prisma.pharmacy.findMany({
    include: { branches: true },
  });

  console.log(`  対象薬局数: ${pharmacies.length}`);

  let created = 0;
  let skipped = 0;

  for (const pharmacy of pharmacies) {
    if (pharmacy.branches.length > 0) {
      console.log(`  SKIP: 薬局ID ${pharmacy.id}（${pharmacy.companyName}）はすでにBranchが存在します`);
      skipped++;
      continue;
    }

    const branchName =
      pharmacy.pharmacyName ||
      pharmacy.companyName;

    const branch = await prisma.pharmacyBranch.create({
      data: {
        pharmacyId: pharmacy.id,
        name: branchName,
        phoneNumber: pharmacy.phoneNumber,
        faxNumber: pharmacy.faxNumber,
        prefecture: pharmacy.prefecture,
        address: pharmacy.address,
        nearestStation: pharmacy.nearestStation,
        minutesFromStation: pharmacy.minutesFromStation,
        carCommuteAvailable: pharmacy.carCommuteAvailable,
        establishedDate: pharmacy.establishedDate,
        dailyPrescriptionCount: pharmacy.dailyPrescriptionCount,
        staffCount: pharmacy.staffCount,
        businessHoursStart: pharmacy.businessHoursStart,
        businessHoursEnd: pharmacy.businessHoursEnd,
        introduction: pharmacy.introduction,
        strengths: pharmacy.strengths,
        equipmentSystems: pharmacy.equipmentSystems,
        displayOrder: 0,
      },
    });

    console.log(`  CREATE: 薬局ID ${pharmacy.id}（${pharmacy.companyName}）→ Branch ID ${branch.id}（${branch.name}）`);
    created++;

    // この法人の既存JobPostingにbranchIdを設定
    const updated = await prisma.jobPosting.updateMany({
      where: { pharmacyId: pharmacy.id, pharmacyBranchId: null },
      data: { pharmacyBranchId: branch.id },
    });
    if (updated.count > 0) {
      console.log(`    求人${updated.count}件にbranchId設定`);
    }
  }

  console.log(`\n✅ 完了: 新規作成 ${created}件 / スキップ ${skipped}件`);
}

main()
  .catch((e) => {
    console.error('❌ エラー:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
