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

