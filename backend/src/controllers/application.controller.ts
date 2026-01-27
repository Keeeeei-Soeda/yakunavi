import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ApplicationService } from '../services/application.service';

export class ApplicationController {
  private applicationService: ApplicationService;

  constructor() {
    this.applicationService = new ApplicationService();
  }

  /**
   * 応募を作成
   */
  createApplication = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.userType !== 'pharmacist') {
        return res.status(403).json({
          success: false,
          error: '薬剤師アカウントのみアクセス可能です',
        });
      }

      const { jobPostingId, pharmacistId, coverLetter } = req.body;

      const application = await this.applicationService.createApplication({
        jobPostingId: BigInt(jobPostingId),
        pharmacistId: BigInt(pharmacistId),
        coverLetter,
      });

      return res.status(201).json({
        success: true,
        message: '応募を送信しました',
        data: application,
      });
    } catch (error: any) {
      console.error('Create application error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || '応募の送信に失敗しました',
      });
    }
  };

  /**
   * 応募ステータスを更新（薬局側）
   */
  updateApplicationStatus = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.userType !== 'pharmacy') {
        return res.status(403).json({
          success: false,
          error: '薬局アカウントのみアクセス可能です',
        });
      }

      const applicationId = BigInt(req.params.id);
      const { status, rejectionReason } = req.body;

      const result = await this.applicationService.updateApplicationStatus(
        applicationId,
        { status, rejectionReason }
      );

      return res.status(200).json({
        success: true,
        message: '応募ステータスを更新しました',
        data: result,
      });
    } catch (error: any) {
      console.error('Update application status error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'ステータスの更新に失敗しました',
      });
    }
  };

  /**
   * 応募詳細を取得
   */
  getApplication = async (req: AuthRequest, res: Response) => {
    try {
      const applicationId = BigInt(req.params.id);
      const application = await this.applicationService.getApplication(
        applicationId
      );

      return res.status(200).json({
        success: true,
        data: application,
      });
    } catch (error: any) {
      console.error('Get application error:', error);
      return res.status(404).json({
        success: false,
        error: error.message || '応募が見つかりません',
      });
    }
  };

  /**
   * 薬局の応募一覧を取得
   */
  getPharmacyApplications = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);
      const { status } = req.query;

      const applications = await this.applicationService.getPharmacyApplications(
        pharmacyId,
        status as string
      );

      return res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error: any) {
      console.error('Get pharmacy applications error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || '応募一覧の取得に失敗しました',
      });
    }
  };

  /**
   * 薬剤師の応募一覧を取得
   */
  getPharmacistApplications = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacistId = BigInt(req.params.pharmacistId);
      const { status } = req.query;

      const applications = await this.applicationService.getPharmacistApplications(
        pharmacistId,
        status as string
      );

      return res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error: any) {
      console.error('Get pharmacist applications error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || '応募一覧の取得に失敗しました',
      });
    }
  };

  /**
   * 応募を取り下げ（薬剤師側）
   * ⚠️ 廃止：一度応募したら、基本的に取り下げはできません
   * やむを得ない場合は運営（support@example.com）までご連絡ください
   */
  // withdrawApplication = async (req: AuthRequest, res: Response) => {
  //   try {
  //     if (!req.user || req.user.userType !== 'pharmacist') {
  //       return res.status(403).json({
  //         success: false,
  //         error: '薬剤師アカウントのみアクセス可能です',
  //       });
  //     }

  //     const applicationId = BigInt(req.params.id);
  //     const { pharmacistId } = req.body;

  //     const result = await this.applicationService.withdrawApplication(
  //       applicationId,
  //       BigInt(pharmacistId)
  //     );

  //     return res.status(200).json({
  //       success: true,
  //       message: '応募を取り下げました',
  //       data: result,
  //     });
  //   } catch (error: any) {
  //     console.error('Withdraw application error:', error);
  //     return res.status(400).json({
  //       success: false,
  //       error: error.message || '応募の取り下げに失敗しました',
  //     });
  //   }
  // };
}

