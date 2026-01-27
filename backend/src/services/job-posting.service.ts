import prisma from '../utils/prisma';

interface CreateJobPostingInput {
  pharmacyId: bigint;
  title: string;
  workLocation: string;
  description?: string;
  desiredWorkDays: number;
  workStartPeriodFrom: Date;
  workStartPeriodTo: Date;
  recruitmentDeadline: Date;
  requirements?: string;
  desiredWorkHours?: string;
  dailyWage: number;
  totalCompensation: number;
  platformFee: number;
  status?: 'draft' | 'published';
}

interface UpdateJobPostingInput {
  title?: string;
  workLocation?: string;
  description?: string;
  desiredWorkDays?: number;
  workStartPeriodFrom?: Date;
  workStartPeriodTo?: Date;
  recruitmentDeadline?: Date;
  requirements?: string;
  desiredWorkHours?: string;
  dailyWage?: number;
  totalCompensation?: number;
  platformFee?: number;
  status?: string;
}

interface SearchJobPostingsParams {
  prefecture?: string;
  minWage?: number;
  maxWage?: number;
  status?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

export class JobPostingService {
  /**
   * 求人を作成
   */
  async createJobPosting(input: CreateJobPostingInput) {
    // 公開時は必ず'published'ステータスにする
    const status = input.status === 'published' ? 'published' : 'draft';
    const publishedAt = status === 'published' ? new Date() : null;

    const jobPosting = await prisma.jobPosting.create({
      data: {
        pharmacyId: BigInt(input.pharmacyId),
        title: input.title,
        workLocation: input.workLocation,
        description: input.description || null,
        desiredWorkDays: input.desiredWorkDays || 30,
        workStartPeriodFrom: input.workStartPeriodFrom ? new Date(input.workStartPeriodFrom) : new Date(),
        workStartPeriodTo: input.workStartPeriodTo ? new Date(input.workStartPeriodTo) : new Date(),
        recruitmentDeadline: input.recruitmentDeadline ? new Date(input.recruitmentDeadline) : new Date(),
        requirements: input.requirements || null,
        desiredWorkHours: input.desiredWorkHours || null,
        dailyWage: input.dailyWage || 25000,
        totalCompensation: input.totalCompensation || 0,
        platformFee: input.platformFee || 0,
        status,
        publishedAt,
      },
    });

    return {
      ...jobPosting,
      id: Number(jobPosting.id),
      pharmacyId: Number(jobPosting.pharmacyId),
    };
  }

  /**
   * 求人を更新
   */
  async updateJobPosting(jobPostingId: bigint, input: UpdateJobPostingInput) {
    const jobPosting = await prisma.jobPosting.update({
      where: { id: jobPostingId },
      data: input,
    });

    return {
      ...jobPosting,
      id: Number(jobPosting.id),
      pharmacyId: Number(jobPosting.pharmacyId),
    };
  }

  /**
   * 求人を削除
   */
  async deleteJobPosting(jobPostingId: bigint) {
    await prisma.jobPosting.delete({
      where: { id: jobPostingId },
    });
  }

  /**
   * 求人を公開
   */
  async publishJobPosting(jobPostingId: bigint) {
    const jobPosting = await prisma.jobPosting.update({
      where: { id: jobPostingId },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });

    return {
      ...jobPosting,
      id: Number(jobPosting.id),
      pharmacyId: Number(jobPosting.pharmacyId),
    };
  }

  /**
   * 求人を非公開
   */
  async unpublishJobPosting(jobPostingId: bigint) {
    const jobPosting = await prisma.jobPosting.update({
      where: { id: jobPostingId },
      data: {
        status: 'draft',
      },
    });

    return {
      ...jobPosting,
      id: Number(jobPosting.id),
      pharmacyId: Number(jobPosting.pharmacyId),
    };
  }

  /**
   * 求人詳細を取得
   */
  async getJobPosting(jobPostingId: bigint) {
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
      include: {
        pharmacy: {
          select: {
            id: true,
            pharmacyName: true,
            prefecture: true,
            address: true,
            nearestStation: true,
            phoneNumber: true,
            introduction: true,
          },
        },
        applications: {
          include: {
            pharmacist: {
              select: {
                id: true,
                lastName: true,
                firstName: true,
                age: true,
                workExperienceYears: true,
                specialtyAreas: true,
              },
            },
          },
        },
      },
    });

    if (!jobPosting) {
      throw new Error('求人が見つかりません');
    }

    return {
      ...jobPosting,
      id: Number(jobPosting.id),
      pharmacyId: Number(jobPosting.pharmacyId),
      pharmacy: {
        ...jobPosting.pharmacy,
        id: Number(jobPosting.pharmacy.id),
      },
      applications: jobPosting.applications.map((app: any) => ({
        ...app,
        id: Number(app.id),
        pharmacistId: Number(app.pharmacistId),
        jobPostingId: Number(app.jobPostingId),
        pharmacist: {
          ...app.pharmacist,
          id: Number(app.pharmacist.id),
        },
      })),
    };
  }

  /**
   * 薬局の求人一覧を取得
   */
  async getPharmacyJobPostings(pharmacyId: bigint) {
    const jobPostings = await prisma.jobPosting.findMany({
      where: { pharmacyId },
      orderBy: { createdAt: 'desc' },
    });

    return jobPostings.map((jp) => ({
      ...jp,
      id: Number(jp.id),
      pharmacyId: Number(jp.pharmacyId),
    }));
  }

  /**
   * 求人を検索
   */
  async searchJobPostings(params: SearchJobPostingsParams) {
    const {
      prefecture,
      minWage,
      maxWage,
      status = 'published',
      keyword,
      page = 1,
      limit = 20,
    } = params;

    const where: any = {
      status,
    };

    // prefectureで検索する場合は、workLocationから都道府県を抽出して検索
    if (prefecture) {
      // workLocationが指定された都道府県で始まるものを検索
      where.workLocation = {
        startsWith: prefecture,
      };
    }

    if (minWage !== undefined || maxWage !== undefined) {
      where.dailyWage = {};
      if (minWage !== undefined) {
        where.dailyWage.gte = minWage;
      }
      if (maxWage !== undefined) {
        where.dailyWage.lte = maxWage;
      }
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
        { workLocation: { contains: keyword } },
      ];
    }

    const [jobPostings, total] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        include: {
          pharmacy: {
            select: {
              id: true,
              pharmacyName: true,
              prefecture: true,
              address: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.jobPosting.count({ where }),
    ]);

    return {
      data: jobPostings.map((jp) => ({
        ...jp,
        id: Number(jp.id),
        pharmacyId: Number(jp.pharmacyId),
        pharmacy: {
          ...jp.pharmacy,
          id: Number(jp.pharmacy.id),
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
