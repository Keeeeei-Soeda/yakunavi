import prisma from '../utils/prisma';

export class FavoriteService {
  /**
   * お気に入り登録
   */
  async addFavorite(pharmacistId: bigint, jobPostingId: bigint) {
    const existing = await prisma.favoriteJob.findUnique({
      where: { pharmacistId_jobPostingId: { pharmacistId, jobPostingId } },
    });
    if (existing) {
      return { alreadyExists: true };
    }

    const favorite = await prisma.favoriteJob.create({
      data: { pharmacistId, jobPostingId },
    });

    return {
      alreadyExists: false,
      favorite: { ...favorite, id: Number(favorite.id) },
    };
  }

  /**
   * お気に入り解除
   */
  async removeFavorite(pharmacistId: bigint, jobPostingId: bigint) {
    await prisma.favoriteJob.deleteMany({
      where: { pharmacistId, jobPostingId },
    });
  }

  /**
   * お気に入り一覧取得
   */
  async getFavorites(pharmacistId: bigint) {
    const favorites = await prisma.favoriteJob.findMany({
      where: { pharmacistId },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            workLocation: true,
            desiredWorkDays: true,
            dailyWage: true,
            totalCompensation: true,
            recruitmentDeadline: true,
            status: true,
            pharmacy: {
              select: {
                id: true,
                companyName: true,
                pharmacyName: true,
                prefecture: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((f) => ({
      id: Number(f.id),
      pharmacistId: Number(f.pharmacistId),
      jobPostingId: Number(f.jobPostingId),
      createdAt: f.createdAt,
      jobPosting: {
        ...f.jobPosting,
        id: Number(f.jobPosting.id),
        pharmacy: {
          ...f.jobPosting.pharmacy,
          id: Number(f.jobPosting.pharmacy.id),
        },
      },
    }));
  }

  /**
   * お気に入り件数取得
   */
  async getFavoriteCount(pharmacistId: bigint) {
    return prisma.favoriteJob.count({ where: { pharmacistId } });
  }

  /**
   * 指定求人がお気に入り済みか確認
   */
  async isFavorite(pharmacistId: bigint, jobPostingId: bigint) {
    const record = await prisma.favoriteJob.findUnique({
      where: { pharmacistId_jobPostingId: { pharmacistId, jobPostingId } },
    });
    return !!record;
  }
}
