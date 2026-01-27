import prisma from '../utils/prisma';

export class PharmacyService {
  /**
   * ダッシュボード統計を取得
   */
  async getDashboardStats(pharmacyId: bigint) {
    // アクティブな求人数
    const activeJobPostings = await prisma.jobPosting.count({
      where: {
        pharmacyId,
        status: 'published',
      },
    });

    // 総応募数
    const totalApplications = await prisma.application.count({
      where: {
        jobPosting: {
          pharmacyId,
        },
      },
    });

    // アクティブな契約数
    const activeContracts = await prisma.contract.count({
      where: {
        pharmacyId,
        status: {
          in: ['pending_payment', 'active'],
        },
      },
    });

    // 承認待ちの契約数
    const pendingContracts = await prisma.contract.count({
      where: {
        pharmacyId,
        status: 'pending_approval',
      },
    });

    return {
      activeJobPostings,
      totalApplications,
      activeContracts,
      pendingContracts,
    };
  }

  /**
   * 最近の応募を取得
   */
  async getRecentApplications(pharmacyId: bigint, limit: number = 5) {
    const applications = await prisma.application.findMany({
      where: {
        jobPosting: {
          pharmacyId,
        },
      },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
          },
        },
        pharmacist: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            age: true,
            workExperienceYears: true,
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
      take: limit,
    });

    return applications.map((app: any) => ({
      ...app,
      id: Number(app.id),
      jobPostingId: Number(app.jobPostingId),
      pharmacistId: Number(app.pharmacistId),
      jobPosting: {
        ...app.jobPosting,
        id: Number(app.jobPosting.id),
      },
      pharmacist: {
        ...app.pharmacist,
        id: Number(app.pharmacist.id),
      },
    }));
  }

  /**
   * アクティブな求人を取得
   */
  async getActiveJobPostings(pharmacyId: bigint, limit: number = 5) {
    const jobPostings = await prisma.jobPosting.findMany({
      where: {
        pharmacyId,
        status: 'published',
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
    });

    return jobPostings.map((jp: any) => ({
      ...jp,
      id: Number(jp.id),
      pharmacyId: Number(jp.pharmacyId),
      applicationCount: jp._count.applications,
    }));
  }
}

