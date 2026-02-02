import prisma from '../utils/prisma';

export class PharmacyService {
  /**
   * 薬局プロフィールを取得
   */
  async getProfile(pharmacyId: bigint) {
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
      select: {
        id: true,
        userId: true,
        pharmacyName: true,
        representativeLastName: true,
        representativeFirstName: true,
        phoneNumber: true,
        faxNumber: true,
        prefecture: true,
        address: true,
        nearestStation: true,
        establishedDate: true,
        dailyPrescriptionCount: true,
        staffCount: true,
        businessHoursStart: true,
        businessHoursEnd: true,
        introduction: true,
        strengths: true,
        equipmentSystems: true,
      },
    });

    if (!pharmacy) {
      throw new Error('薬局が見つかりません');
    }

    return {
      ...pharmacy,
      id: Number(pharmacy.id),
      userId: Number(pharmacy.userId),
    };
  }

  /**
   * 薬局プロフィールを更新
   */
  async updateProfile(pharmacyId: bigint, data: any) {
    const updateData: any = {};

    // 更新可能なフィールドのみを抽出
    if (data.pharmacyName !== undefined) updateData.pharmacyName = data.pharmacyName;
    if (data.representativeLastName !== undefined) updateData.representativeLastName = data.representativeLastName;
    if (data.representativeFirstName !== undefined) updateData.representativeFirstName = data.representativeFirstName;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.faxNumber !== undefined) updateData.faxNumber = data.faxNumber;
    if (data.prefecture !== undefined) updateData.prefecture = data.prefecture;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.nearestStation !== undefined) updateData.nearestStation = data.nearestStation;
    if (data.establishedDate !== undefined) {
      updateData.establishedDate = data.establishedDate ? new Date(data.establishedDate) : null;
    }
    if (data.dailyPrescriptionCount !== undefined) updateData.dailyPrescriptionCount = data.dailyPrescriptionCount;
    if (data.staffCount !== undefined) updateData.staffCount = data.staffCount;
    if (data.businessHoursStart !== undefined) {
      updateData.businessHoursStart = data.businessHoursStart ? new Date(`1970-01-01T${data.businessHoursStart}`) : null;
    }
    if (data.businessHoursEnd !== undefined) {
      updateData.businessHoursEnd = data.businessHoursEnd ? new Date(`1970-01-01T${data.businessHoursEnd}`) : null;
    }
    if (data.introduction !== undefined) updateData.introduction = data.introduction;
    if (data.strengths !== undefined) updateData.strengths = data.strengths;
    if (data.equipmentSystems !== undefined) updateData.equipmentSystems = data.equipmentSystems;

    const pharmacy = await prisma.pharmacy.update({
      where: { id: pharmacyId },
      data: updateData,
    });

    return {
      ...pharmacy,
      id: Number(pharmacy.id),
      userId: Number(pharmacy.userId),
    };
  }

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

