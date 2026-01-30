import prisma from '../src/utils/prisma';

async function listPharmacies() {
    const pharmacies = await prisma.pharmacy.findMany({
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
    });
    console.log(`薬局: ${pharmacies.length}件\n`);
    pharmacies.forEach((p) => {
        console.log(`${p.id} | ${p.pharmacyName} | ${p.user.email}`);
    });
    await prisma.$disconnect();
}

listPharmacies();

