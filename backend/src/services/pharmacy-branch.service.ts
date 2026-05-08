import prisma from '../utils/prisma';

export const DAY_OF_WEEK_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
export type DayOfWeek = (typeof DAY_OF_WEEK_ORDER)[number];

export interface BusinessHourInput {
  dayOfWeek: DayOfWeek;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

export class PharmacyBranchService {
  /**
   * 法人に紐づく薬局一覧を取得（曜日別営業時間含む）
   */
  async getBranches(pharmacyId: bigint) {
    const branches = await prisma.pharmacyBranch.findMany({
      where: { pharmacyId },
      include: {
        businessHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return branches.map((b) => this.serializeBranch(b));
  }

  /**
   * 1薬局の詳細を取得（曜日別営業時間含む）
   */
  async getBranch(branchId: bigint, pharmacyId: bigint) {
    const branch = await prisma.pharmacyBranch.findFirst({
      where: { id: branchId, pharmacyId },
      include: {
        businessHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!branch) throw new Error('薬局が見つかりません');

    return this.serializeBranch(branch);
  }

  /**
   * 曜日別営業時間を取得
   */
  async getBusinessHours(branchId: bigint, pharmacyId: bigint) {
    const branch = await prisma.pharmacyBranch.findFirst({
      where: { id: branchId, pharmacyId },
    });
    if (!branch) throw new Error('薬局が見つかりません');

    const hours = await prisma.businessHour.findMany({
      where: { pharmacyBranchId: branchId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return hours.map((h) => ({
      ...h,
      id: Number(h.id),
      pharmacyBranchId: Number(h.pharmacyBranchId),
    }));
  }

  /**
   * 曜日別営業時間を一括更新（7曜日分をupsert）
   */
  async upsertBusinessHours(branchId: bigint, pharmacyId: bigint, hours: BusinessHourInput[]) {
    const branch = await prisma.pharmacyBranch.findFirst({
      where: { id: branchId, pharmacyId },
    });
    if (!branch) throw new Error('薬局が見つかりません');

    const validDays = new Set(DAY_OF_WEEK_ORDER);
    for (const h of hours) {
      if (!validDays.has(h.dayOfWeek)) {
        throw new Error(`無効な曜日コード: ${h.dayOfWeek}`);
      }
      if (!h.isClosed) {
        if (!h.openTime || !h.closeTime) {
          throw new Error(`${h.dayOfWeek}: 定休日以外は開始・終了時間を入力してください`);
        }
        if (!/^\d{2}:\d{2}$/.test(h.openTime) || !/^\d{2}:\d{2}$/.test(h.closeTime)) {
          throw new Error(`${h.dayOfWeek}: 時間はHH:MM形式で入力してください`);
        }
      }
    }

    const results = await Promise.all(
      hours.map((h) =>
        prisma.businessHour.upsert({
          where: {
            pharmacyBranchId_dayOfWeek: {
              pharmacyBranchId: branchId,
              dayOfWeek: h.dayOfWeek,
            },
          },
          update: {
            openTime: h.isClosed ? null : h.openTime,
            closeTime: h.isClosed ? null : h.closeTime,
            isClosed: h.isClosed,
          },
          create: {
            pharmacyBranchId: branchId,
            dayOfWeek: h.dayOfWeek,
            openTime: h.isClosed ? null : h.openTime,
            closeTime: h.isClosed ? null : h.closeTime,
            isClosed: h.isClosed,
          },
        })
      )
    );

    return results.map((h) => ({
      ...h,
      id: Number(h.id),
      pharmacyBranchId: Number(h.pharmacyBranchId),
    }));
  }

  /**
   * 薬局を追加
   */
  async createBranch(pharmacyId: bigint, data: any) {
    const count = await prisma.pharmacyBranch.count({ where: { pharmacyId } });

    const branch = await prisma.pharmacyBranch.create({
      data: {
        pharmacyId,
        name: data.name || `薬局${count + 1}`,
        phoneNumber: data.phoneNumber ?? null,
        faxNumber: data.faxNumber ?? null,
        prefecture: data.prefecture ?? null,
        address: data.address ?? null,
        nearestStation: data.nearestStation ?? null,
        minutesFromStation: data.minutesFromStation ?? null,
        carCommuteAvailable: data.carCommuteAvailable ?? null,
        establishedDate: data.establishedDate ? new Date(data.establishedDate) : null,
        dailyPrescriptionCount: data.dailyPrescriptionCount ?? null,
        staffCount: data.staffCount ?? null,
        businessHoursStart: this.parseTime(data.businessHoursStart),
        businessHoursEnd: this.parseTime(data.businessHoursEnd),
        introduction: data.introduction ?? null,
        strengths: data.strengths ?? null,
        equipmentSystems: data.equipmentSystems ?? null,
        displayOrder: count,
      },
    });

    return {
      ...branch,
      id: Number(branch.id),
      pharmacyId: Number(branch.pharmacyId),
    };
  }

  /**
   * 薬局情報を更新
   */
  async updateBranch(branchId: bigint, pharmacyId: bigint, data: any) {
    const existing = await prisma.pharmacyBranch.findFirst({
      where: { id: branchId, pharmacyId },
    });
    if (!existing) throw new Error('薬局が見つかりません');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.faxNumber !== undefined) updateData.faxNumber = data.faxNumber;
    if (data.prefecture !== undefined) updateData.prefecture = data.prefecture;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.nearestStation !== undefined) updateData.nearestStation = data.nearestStation;
    if (data.minutesFromStation !== undefined) updateData.minutesFromStation = data.minutesFromStation;
    if (data.carCommuteAvailable !== undefined) updateData.carCommuteAvailable = data.carCommuteAvailable;
    if (data.establishedDate !== undefined) {
      updateData.establishedDate = data.establishedDate ? new Date(data.establishedDate) : null;
    }
    if (data.dailyPrescriptionCount !== undefined) updateData.dailyPrescriptionCount = data.dailyPrescriptionCount;
    if (data.staffCount !== undefined) updateData.staffCount = data.staffCount;
    if (data.businessHoursStart !== undefined) {
      updateData.businessHoursStart = this.parseTime(data.businessHoursStart);
    }
    if (data.businessHoursEnd !== undefined) {
      updateData.businessHoursEnd = this.parseTime(data.businessHoursEnd);
    }
    if (data.introduction !== undefined) updateData.introduction = data.introduction;
    if (data.strengths !== undefined) updateData.strengths = data.strengths;
    if (data.equipmentSystems !== undefined) updateData.equipmentSystems = data.equipmentSystems;

    const branch = await prisma.pharmacyBranch.update({
      where: { id: branchId },
      data: updateData,
    });

    return {
      ...branch,
      id: Number(branch.id),
      pharmacyId: Number(branch.pharmacyId),
    };
  }

  /**
   * 薬局を削除（求人が紐づいていない場合のみ）
   */
  async deleteBranch(branchId: bigint, pharmacyId: bigint) {
    const existing = await prisma.pharmacyBranch.findFirst({
      where: { id: branchId, pharmacyId },
    });
    if (!existing) throw new Error('薬局が見つかりません');

    const jobCount = await prisma.jobPosting.count({
      where: { pharmacyBranchId: branchId, status: { not: 'closed' } },
    });
    if (jobCount > 0) {
      throw new Error('公開中・下書き中の求人が紐づいているため削除できません');
    }

    const totalBranches = await prisma.pharmacyBranch.count({ where: { pharmacyId } });
    if (totalBranches <= 1) {
      throw new Error('最後の薬局は削除できません');
    }

    await prisma.pharmacyBranch.delete({ where: { id: branchId } });
  }

  private parseTime(value?: string | null): Date | null {
    if (!value) return null;
    if (/^\d{2}:\d{2}$/.test(value)) {
      return new Date(`1970-01-01T${value}:00`);
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  private serializeBranch(branch: any) {
    return {
      ...branch,
      id: Number(branch.id),
      pharmacyId: Number(branch.pharmacyId),
      businessHours: (branch.businessHours ?? []).map((h: any) => ({
        ...h,
        id: Number(h.id),
        pharmacyBranchId: Number(h.pharmacyBranchId),
      })),
    };
  }
}
