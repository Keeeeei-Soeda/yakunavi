import prisma from '../utils/prisma';

interface CreateApplicationInput {
  jobPostingId: bigint;
  pharmacistId: bigint;
  coverLetter?: string;
  nearestStation?: string;
  workExperienceTypes?: string[];
}

interface UpdateApplicationStatusInput {
  status: string;
  rejectionReason?: string;
}

export class ApplicationService {
  /**
   * 応募を作成
   */
  async createApplication(input: CreateApplicationInput) {
    const { jobPostingId, pharmacistId, coverLetter, nearestStation, workExperienceTypes } = input;

    console.log('[Application] Creating application:', {
      jobPostingId,
      pharmacistId,
      nearestStation,
      workExperienceTypes,
      workExperienceTypesType: typeof workExperienceTypes,
      workExperienceTypesIsArray: Array.isArray(workExperienceTypes),
    });

    // 薬剤師プロフィールを取得
    const pharmacist = await prisma.pharmacist.findUnique({
      where: { id: pharmacistId },
    });

    if (!pharmacist) {
      throw new Error('薬剤師プロフィールが見つかりません');
    }

    // 証明書確認チェック
    if (pharmacist.verificationStatus !== 'verified') {
      throw new Error('応募するには資格証明書のアップロードと確認が必要です');
    }

    // 必須項目チェック
    const finalNearestStation = nearestStation || pharmacist.nearestStation;
    const finalWorkExperienceTypes = workExperienceTypes || pharmacist.workExperienceTypes;

    if (!finalNearestStation) {
      throw new Error('最寄駅の入力が必要です');
    }

    if (!finalWorkExperienceTypes || finalWorkExperienceTypes.length === 0) {
      throw new Error('勤務経験のある業態を最低1つ選択してください');
    }

    // 求人が存在するか確認
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
    });

    if (!jobPosting) {
      throw new Error('求人が見つかりません');
    }

    if (jobPosting.status !== 'published') {
      throw new Error('この求人は現在応募できません');
    }

    // 重複応募チェック
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobPostingId,
        pharmacistId,
      },
    });

    if (existingApplication) {
      throw new Error('既にこの求人に応募済みです');
    }

    // 応募を作成
    const application = await prisma.application.create({
      data: {
        jobPostingId,
        pharmacistId,
        coverLetter,
        nearestStation: finalNearestStation,
        status: 'applied',
        appliedAt: new Date(),
      },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            pharmacy: {
              select: {
                id: true,
                pharmacyName: true,
              },
            },
          },
        },
      },
    });

    return {
      ...application,
      id: Number(application.id),
      jobPostingId: Number(application.jobPostingId),
      pharmacistId: Number(application.pharmacistId),
      jobPosting: {
        ...application.jobPosting,
        id: Number(application.jobPosting.id),
        pharmacy: {
          ...application.jobPosting.pharmacy,
          id: Number(application.jobPosting.pharmacy.id),
        },
      },
    };
  }

  /**
   * 応募ステータスを更新
   */
  async updateApplicationStatus(
    applicationId: bigint,
    input: UpdateApplicationStatusInput
  ) {
    const { status, rejectionReason } = input;

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        ...(status === 'reviewed' && { reviewedAt: new Date() }),
        ...(status === 'offered' && { offeredAt: new Date() }),
        ...(status === 'approved' && { respondedAt: new Date() }),
      },
    });

    return {
      id: Number(application.id),
      status: application.status,
      reviewedAt: application.reviewedAt,
      offeredAt: application.offeredAt,
      respondedAt: application.respondedAt,
    };
  }

  /**
   * 応募詳細を取得
   */
  async getApplication(applicationId: bigint) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobPosting: {
          include: {
            pharmacy: {
              select: {
                id: true,
                pharmacyName: true,
                prefecture: true,
                address: true,
                phoneNumber: true,
              },
            },
          },
        },
        pharmacist: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            phoneNumber: true,
            age: true,
            university: true,
            graduationYear: true,
            licenseYear: true,
            certifiedPharmacistLicense: true,
            otherLicenses: true,
            workExperienceYears: true,
            workExperienceMonths: true,
            workExperienceTypes: true,
            mainDuties: true,
            specialtyAreas: true,
            pharmacySystems: true,
            specialNotes: true,
            selfIntroduction: true,
          },
        },
        contract: {
          include: {
            payment: {
              select: {
                id: true,
                confirmedAt: true,
                paymentStatus: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new Error('応募が見つかりません');
    }

    return {
      ...application,
      id: Number(application.id),
      jobPostingId: Number(application.jobPostingId),
      pharmacistId: Number(application.pharmacistId),
      jobPosting: {
        ...application.jobPosting,
        id: Number(application.jobPosting.id),
        pharmacyId: Number(application.jobPosting.pharmacyId),
        pharmacy: {
          ...application.jobPosting.pharmacy,
          id: Number(application.jobPosting.pharmacy.id),
        },
      },
      pharmacist: {
        ...application.pharmacist,
        id: Number(application.pharmacist.id),
      },
      contract: application.contract ? {
        ...application.contract,
        id: Number(application.contract.id),
        applicationId: Number(application.contract.applicationId),
        pharmacyId: Number(application.contract.pharmacyId),
        pharmacistId: Number(application.contract.pharmacistId),
        jobPostingId: Number(application.contract.jobPostingId),
        payment: application.contract.payment ? {
          ...application.contract.payment,
          id: Number(application.contract.payment.id),
        } : null,
      } : null,
    };
  }

  /**
   * 薬局の応募一覧を取得
   */
  async getPharmacyApplications(pharmacyId: bigint, status?: string) {
    const where: any = {
      jobPosting: {
        pharmacyId,
      },
    };

    if (status) {
      where.status = status;
    }

    const applications = await prisma.application.findMany({
      where,
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
          },
        },
        contract: {
          include: {
            payment: {
              select: {
                id: true,
                confirmedAt: true,
                paymentStatus: true,
              },
            },
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
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
      contract: app.contract ? {
        ...app.contract,
        id: Number(app.contract.id),
        applicationId: Number(app.contract.applicationId),
        pharmacyId: Number(app.contract.pharmacyId),
        pharmacistId: Number(app.contract.pharmacistId),
        jobPostingId: Number(app.contract.jobPostingId),
        payment: app.contract.payment ? {
          ...app.contract.payment,
          id: Number(app.contract.payment.id),
        } : null,
      } : null,
    }));
  }

  /**
   * 薬剤師の応募一覧を取得
   */
  async getPharmacistApplications(pharmacistId: bigint, status?: string) {
    const where: any = {
      pharmacistId,
    };

    if (status) {
      where.status = status;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            dailyWage: true,
            workLocation: true,
            desiredWorkHours: true,
            pharmacy: {
              select: {
                id: true,
                pharmacyName: true,
              },
            },
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    return applications.map((app: any) => ({
      ...app,
      id: Number(app.id),
      jobPostingId: Number(app.jobPostingId),
      pharmacistId: Number(app.pharmacistId),
      jobPosting: app.jobPosting ? {
        ...app.jobPosting,
        id: Number(app.jobPosting.id),
        pharmacy: app.jobPosting.pharmacy ? {
          ...app.jobPosting.pharmacy,
          id: Number(app.jobPosting.pharmacy.id),
        } : undefined,
      } : undefined,
    }));
  }

  /**
   * 応募を取り下げ（廃止：運営への連絡が必要）
   * ⚠️ 一度応募したら、基本的に取り下げはできません
   * やむを得ない場合は運営（support@example.com）までご連絡ください
   */
  // async withdrawApplication(applicationId: bigint, pharmacistId: bigint) {
  //   const application = await prisma.application.findUnique({
  //     where: { id: applicationId },
  //   });

  //   if (!application) {
  //     throw new Error('応募が見つかりません');
  //   }

  //   if (application.pharmacistId !== pharmacistId) {
  //     throw new Error('この応募を取り下げる権限がありません');
  //   }

  //   if (!['applied', 'under_review'].includes(application.status)) {
  //     throw new Error('この応募は取り下げできません');
  //   }

  //   await prisma.application.update({
  //     where: { id: applicationId },
  //     data: {
  //       status: 'withdrawn',
  //     },
  //   });

  //   return {
  //     id: Number(applicationId),
  //     status: 'withdrawn',
  //   };
  // }
}

