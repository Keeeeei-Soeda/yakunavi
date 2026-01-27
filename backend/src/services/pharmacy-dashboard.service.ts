import prisma from '../utils/prisma';
import { PharmacyDashboardStats } from '../types';

export class PharmacyDashboardService {
  /**
   * 薬局ダッシュボードの統計データを取得
   */
  async getDashboardStats(pharmacyId: bigint): Promise<PharmacyDashboardStats> {
    // アクティブな求人数
    const activeJobPostings = await prisma.jobPosting.count({
      where: {
        pharmacyId,
        status: 'active'
      }
    });

    // 総応募数
    const totalApplications = await prisma.application.count({
      where: {
        jobPosting: {
          pharmacyId
        }
      }
    });

    // アクティブな契約数
    const activeContracts = await prisma.contract.count({
      where: {
        pharmacyId,
        status: {
          in: ['active', 'in_progress']
        }
      }
    });

    // 承認待ちの契約数
    const pendingContracts = await prisma.contract.count({
      where: {
        pharmacyId,
        status: 'pending_approval'
      }
    });

    return {
      activeJobPostings,
      totalApplications,
      activeContracts,
      pendingContracts
    };
  }

  /**
   * 最近の応募を取得
   */
  async getRecentApplications(pharmacyId: bigint, limit: number = 5) {
    const applications = await prisma.application.findMany({
      where: {
        jobPosting: {
          pharmacyId
        }
      },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true
          }
        },
        pharmacist: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            age: true,
            workExperienceYears: true
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      },
      take: limit
    });

    return applications;
  }

  /**
   * アクティブな求人を取得
   */
  async getActiveJobPostings(pharmacyId: bigint, limit: number = 5) {
    const jobPostings = await prisma.jobPosting.findMany({
      where: {
        pharmacyId,
        status: 'active'
      },
      include: {
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit
    });

    return jobPostings;
  }

  /**
   * 月別の応募統計を取得
   */
  async getMonthlyApplicationStats(pharmacyId: bigint, months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const applications = await prisma.application.findMany({
      where: {
        jobPosting: {
          pharmacyId
        },
        appliedAt: {
          gte: startDate
        }
      },
      select: {
        appliedAt: true,
        status: true
      }
    });

    // 月別にグループ化
    const monthlyStats = applications.reduce((acc, app) => {
      const month = app.appliedAt.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          total: 0,
          accepted: 0,
          rejected: 0,
          pending: 0
        };
      }
      acc[month].total++;
      if (app.status === 'accepted') acc[month].accepted++;
      else if (app.status === 'rejected') acc[month].rejected++;
      else acc[month].pending++;
      return acc;
    }, {} as Record<string, any>);

    return monthlyStats;
  }
}

