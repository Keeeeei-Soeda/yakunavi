import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PharmacistDashboardService } from '../services/pharmacist-dashboard.service';

export class PharmacistDashboardController {
  private dashboardService: PharmacistDashboardService;

  constructor() {
    this.dashboardService = new PharmacistDashboardService();
  }

  /**
   * ダッシュボード統計データ取得
   */
  getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacistId = BigInt(req.params.pharmacistId);

      // 認証ユーザーが該当の薬剤師であることを確認
      if (req.user?.userType !== 'pharmacist') {
        return res.status(403).json({
          error: 'Forbidden',
          message: '薬剤師アカウントでのみアクセス可能です'
        });
      }

      const stats = await this.dashboardService.getDashboardStats(pharmacistId);

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
   * 最近の通知取得
   */
  getRecentNotifications = async (req: AuthRequest, res: Response) => {
    try {
      const userId = BigInt(req.user!.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      if (req.user?.userType !== 'pharmacist') {
        return res.status(403).json({
          error: 'Forbidden',
          message: '薬剤師アカウントでのみアクセス可能です'
        });
      }

      const notifications = await this.dashboardService.getRecentNotifications(userId, limit);

      return res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: '通知の取得に失敗しました'
      });
    }
  };

  /**
   * 進行中の応募取得
   */
  getActiveApplications = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacistId = BigInt(req.params.pharmacistId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      if (req.user?.userType !== 'pharmacist') {
        return res.status(403).json({
          error: 'Forbidden',
          message: '薬剤師アカウントでのみアクセス可能です'
        });
      }

      const applications = await this.dashboardService.getActiveApplications(pharmacistId, limit);

      return res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Error fetching active applications:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: '応募データの取得に失敗しました'
      });
    }
  };

  /**
   * 進行中の契約取得
   */
  getActiveContracts = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacistId = BigInt(req.params.pharmacistId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      if (req.user?.userType !== 'pharmacist') {
        return res.status(403).json({
          error: 'Forbidden',
          message: '薬剤師アカウントでのみアクセス可能です'
        });
      }

      const contracts = await this.dashboardService.getActiveContracts(pharmacistId, limit);

      return res.status(200).json({
        success: true,
        data: contracts
      });
    } catch (error) {
      console.error('Error fetching active contracts:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: '契約データの取得に失敗しました'
      });
    }
  };

  /**
   * 応募履歴統計取得
   */
  getApplicationHistory = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacistId = BigInt(req.params.pharmacistId);

      if (req.user?.userType !== 'pharmacist') {
        return res.status(403).json({
          error: 'Forbidden',
          message: '薬剤師アカウントでのみアクセス可能です'
        });
      }

      const stats = await this.dashboardService.getApplicationHistory(pharmacistId);

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching application history:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: '統計データの取得に失敗しました'
      });
    }
  };
}

