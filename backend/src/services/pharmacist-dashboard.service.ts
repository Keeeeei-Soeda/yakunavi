import prisma from '../utils/prisma';
import { PharmacistDashboardStats } from '../types';

export class PharmacistDashboardService {
  /**
   * 薬剤師ダッシュボードの統計データを取得
   */
  async getDashboardStats(pharmacistId: bigint): Promise<PharmacistDashboardStats> {
    // アクティブな応募数
    const activeApplications = await prisma.application.count({
      where: {
        pharmacistId,
        status: {
          in: ['pending', 'under_review', 'interview_scheduled']
        }
      }
    });

    // アクティブな契約数
    const activeContracts = await prisma.contract.count({
      where: {
        pharmacistId,
        status: {
          in: ['active', 'in_progress']
        }
      }
    });

    // 未読メッセージ数
    const unreadMessages = await prisma.message.count({
      where: {
        application: {
          pharmacistId
        },
        senderType: 'pharmacy',
        isRead: false
      }
    });

    return {
      activeApplications,
      activeContracts,
      unreadMessages
    };
  }

  /**
   * 最近の通知を取得
   */
  async getRecentNotifications(userId: bigint, limit: number = 5) {
    const notifications = await prisma.notification.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return notifications;
  }

  /**
   * 進行中の応募を取得
   */
  async getActiveApplications(pharmacistId: bigint, limit: number = 5) {
    const applications = await prisma.application.findMany({
      where: {
        pharmacistId,
        status: {
          in: ['pending', 'under_review', 'interview_scheduled', 'offered']
        }
      },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            workLocation: true,
            dailyWage: true,
            desiredWorkDays: true,
            pharmacy: {
              select: {
                pharmacyName: true
              }
            }
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
   * 進行中の契約を取得
   */
  async getActiveContracts(pharmacistId: bigint, limit: number = 5) {
    const contracts = await prisma.contract.findMany({
      where: {
        pharmacistId,
        status: {
          in: ['pending_approval', 'active', 'in_progress']
        }
      },
      include: {
        pharmacy: {
          select: {
            pharmacyName: true
          }
        },
        jobPosting: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return contracts;
  }

  /**
   * 応募履歴統計を取得
   */
  async getApplicationHistory(pharmacistId: bigint) {
    const applications = await prisma.application.findMany({
      where: {
        pharmacistId
      },
      select: {
        status: true,
        appliedAt: true
      }
    });

    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    };

    return stats;
  }
}

