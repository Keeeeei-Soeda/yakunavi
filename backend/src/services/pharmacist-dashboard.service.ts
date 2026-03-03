import prisma from '../utils/prisma';
import { PharmacistDashboardStats } from '../types';

export class PharmacistDashboardService {
  /**
   * 薬剤師ダッシュボードの統計データを取得
   */
  async getDashboardStats(pharmacistId: bigint): Promise<PharmacistDashboardStats> {
    const [activeApplications, activeContracts, unreadMessages, favoriteJobs] = await Promise.all([
      prisma.application.count({
        where: {
          pharmacistId,
          status: { in: ['pending', 'under_review', 'interview_scheduled'] }
        }
      }),
      prisma.contract.count({
        where: {
          pharmacistId,
          status: { in: ['active', 'in_progress'] }
        }
      }),
      prisma.message.count({
        where: {
          application: { pharmacistId },
          senderType: 'pharmacy',
          isRead: false
        }
      }),
      prisma.favoriteJob.count({ where: { pharmacistId } }),
    ]);

    return { activeApplications, activeContracts, unreadMessages, favoriteJobs };
  }

  /**
   * 最近の通知を取得
   */
  async getRecentNotifications(userId: bigint, limit: number = 5) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return notifications;
  }

  /**
   * 全通知を取得
   */
  async getAllNotifications(userId: bigint) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return notifications;
  }

  /**
   * 通知を既読にする
   */
  async markNotificationRead(notificationId: bigint, userId: bigint) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.userId !== userId) {
      throw new Error('通知が見つかりません');
    }
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * 全通知を既読にする
   */
  async markAllNotificationsRead(userId: bigint) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * 未読通知数を取得
   */
  async getUnreadCount(userId: bigint) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
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
                companyName: true,
                pharmacyName: true,
                id: true,
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

    // BigIntをNumberに変換
    return applications.map((app) => ({
      ...app,
      id: Number(app.id),
      jobPostingId: Number(app.jobPostingId),
      pharmacistId: Number(app.pharmacistId),
      jobPosting: {
        ...app.jobPosting,
        id: Number(app.jobPosting.id),
        pharmacy: {
          ...app.jobPosting.pharmacy,
          id: Number(app.jobPosting.pharmacy.id),
        },
      },
    }));
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
            companyName: true,
                pharmacyName: true,
            id: true,
          }
        },
        jobPosting: {
          select: {
            title: true,
            id: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // BigIntをNumberに変換
    return contracts.map((contract) => ({
      ...contract,
      id: Number(contract.id),
      applicationId: Number(contract.applicationId),
      pharmacyId: Number(contract.pharmacyId),
      pharmacistId: Number(contract.pharmacistId),
      jobPostingId: Number(contract.jobPostingId),
      pharmacy: {
        ...contract.pharmacy,
        id: Number(contract.pharmacy.id),
      },
      jobPosting: {
        ...contract.jobPosting,
        id: Number(contract.jobPosting.id),
      },
    }));
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

