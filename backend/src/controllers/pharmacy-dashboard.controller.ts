import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PharmacyDashboardService } from '../services/pharmacy-dashboard.service';

export class PharmacyDashboardController {
  private dashboardService: PharmacyDashboardService;

  constructor() {
    this.dashboardService = new PharmacyDashboardService();
  }

  /**
   * ダッシュボード統計データ取得
   */
  getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);

      // 認証ユーザーが該当の薬局であることを確認
      if (req.user?.userType !== 'pharmacy') {
        return res.status(403).json({
          error: 'Forbidden',
          message: '薬局アカウントでのみアクセス可能です'
        });
      }

      const stats = await this.dashboardService.getDashboardStats(pharmacyId);

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: '統計データの取得に失敗しました'
      });
    }
  };

  /**
   * 最近の応募取得
   */
  getRecentApplications = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      if (req.user?.userType !== 'pharmacy') {
        return res.status(403).json({
          error: 'Forbidden',
          message: '薬局アカウントでのみアクセス可能です'
        });
      }

      const applications = await this.dashboardService.getRecentApplications(pharmacyId, limit);

      return res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Error fetching recent applications:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: '応募データの取得に失敗しました'
      });
    }
  };

  /**
   * アクティブな求人取得
   */
  getActiveJobPostings = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      if (req.user?.userType !== 'pharmacy') {
        return res.status(403).json({
          error: 'Forbidden',
          message: '薬局アカウントでのみアクセス可能です'
        });
      }

      const jobPostings = await this.dashboardService.getActiveJobPostings(pharmacyId, limit);

      return res.status(200).json({
        success: true,
        data: jobPostings
      });
    } catch (error) {
      console.error('Error fetching active job postings:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: '求人データの取得に失敗しました'
      });
    }
  };

  /**
   * 月別応募統計取得
   */
  getMonthlyApplicationStats = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);
      const months = req.query.months ? parseInt(req.query.months as string) : 6;

      if (req.user?.userType !== 'pharmacy') {
        return res.status(403).json({
          error: 'Forbidden',
          message: '薬局アカウントでのみアクセス可能です'
        });
      }

      const stats = await this.dashboardService.getMonthlyApplicationStats(pharmacyId, months);

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching monthly application stats:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: '統計データの取得に失敗しました'
      });
    }
  };
}

