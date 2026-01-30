import { Request, Response } from 'express';
import { PharmacyService } from '../services/pharmacy.service';
import { AuthRequest } from '../middleware/auth';

const pharmacyService = new PharmacyService();

export class PharmacyController {
  /**
   * 薬局プロフィールを取得
   */
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);

      const profile = await pharmacyService.getProfile(pharmacyId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error('Get pharmacy profile error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '薬局プロフィールの取得に失敗しました',
      });
    }
  }

  /**
   * 薬局プロフィールを更新
   */
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);

      const profile = await pharmacyService.updateProfile(pharmacyId, req.body);

      res.json({
        success: true,
        message: 'プロフィールを更新しました',
        data: profile,
      });
    } catch (error) {
      console.error('Update pharmacy profile error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '薬局プロフィールの更新に失敗しました',
      });
    }
  }

  /**
   * ダッシュボード統計を取得
   */
  async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);

      const stats = await pharmacyService.getDashboardStats(pharmacyId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'ダッシュボード統計の取得に失敗しました',
      });
    }
  }

  /**
   * 最近の応募を取得
   */
  async getRecentApplications(req: AuthRequest, res: Response) {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);
      const limit = req.query.limit ? Number(req.query.limit) : 5;

      const applications = await pharmacyService.getRecentApplications(pharmacyId, limit);

      res.json({
        success: true,
        data: applications,
      });
    } catch (error) {
      console.error('Get recent applications error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '最近の応募の取得に失敗しました',
      });
    }
  }

  /**
   * アクティブな求人を取得
   */
  async getActiveJobPostings(req: AuthRequest, res: Response) {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);
      const limit = req.query.limit ? Number(req.query.limit) : 5;

      const jobPostings = await pharmacyService.getActiveJobPostings(pharmacyId, limit);

      res.json({
        success: true,
        data: jobPostings,
      });
    } catch (error) {
      console.error('Get active job postings error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'アクティブな求人の取得に失敗しました',
      });
    }
  }
}

