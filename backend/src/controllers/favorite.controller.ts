import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FavoriteService } from '../services/favorite.service';
import prisma from '../utils/prisma';

export class FavoriteController {
  private favoriteService: FavoriteService;

  constructor() {
    this.favoriteService = new FavoriteService();
  }

  private async getPharmacistId(userId: number): Promise<bigint> {
    const pharmacist = await prisma.pharmacist.findUnique({
      where: { userId: BigInt(userId) },
      select: { id: true },
    });
    if (!pharmacist) throw new Error('薬剤師情報が見つかりません');
    return pharmacist.id;
  }

  /**
   * お気に入り一覧取得
   */
  getFavorites = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacistId = await this.getPharmacistId(req.user!.id);
      const favorites = await this.favoriteService.getFavorites(pharmacistId);
      return res.status(200).json({ success: true, data: favorites });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return res.status(500).json({ success: false, error: 'お気に入りの取得に失敗しました' });
    }
  };

  /**
   * お気に入り件数取得
   */
  getFavoriteCount = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacistId = await this.getPharmacistId(req.user!.id);
      const count = await this.favoriteService.getFavoriteCount(pharmacistId);
      return res.status(200).json({ success: true, data: { count } });
    } catch (error) {
      console.error('Error fetching favorite count:', error);
      return res.status(500).json({ success: false, error: 'お気に入り件数の取得に失敗しました' });
    }
  };

  /**
   * お気に入り追加
   */
  addFavorite = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacistId = await this.getPharmacistId(req.user!.id);
      const jobPostingId = BigInt(req.params.jobPostingId);
      const result = await this.favoriteService.addFavorite(pharmacistId, jobPostingId);
      if (result.alreadyExists) {
        return res.status(200).json({ success: true, data: { message: '既にお気に入り登録済みです' } });
      }
      return res.status(201).json({ success: true, data: result.favorite });
    } catch (error) {
      console.error('Error adding favorite:', error);
      return res.status(500).json({ success: false, error: 'お気に入りの追加に失敗しました' });
    }
  };

  /**
   * お気に入り解除
   */
  removeFavorite = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacistId = await this.getPharmacistId(req.user!.id);
      const jobPostingId = BigInt(req.params.jobPostingId);
      await this.favoriteService.removeFavorite(pharmacistId, jobPostingId);
      return res.status(200).json({ success: true, data: { message: 'お気に入りを解除しました' } });
    } catch (error) {
      console.error('Error removing favorite:', error);
      return res.status(500).json({ success: false, error: 'お気に入りの解除に失敗しました' });
    }
  };

  /**
   * 指定求人のお気に入り状態確認
   */
  checkFavorite = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacistId = await this.getPharmacistId(req.user!.id);
      const jobPostingId = BigInt(req.params.jobPostingId);
      const isFavorite = await this.favoriteService.isFavorite(pharmacistId, jobPostingId);
      return res.status(200).json({ success: true, data: { isFavorite } });
    } catch (error) {
      console.error('Error checking favorite:', error);
      return res.status(500).json({ success: false, error: 'お気に入り状態の確認に失敗しました' });
    }
  };
}
