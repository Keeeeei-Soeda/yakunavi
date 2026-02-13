import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PharmacistProfileService } from '../services/pharmacist-profile.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// アップロード設定
const uploadDir = process.env.UPLOAD_DIR || './uploads/certificates';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `certificate-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('許可されていないファイル形式です'));
    }
  },
});

export const uploadMiddleware = upload.single('file');

export class PharmacistProfileController {
  private profileService: PharmacistProfileService;

  constructor() {
    this.profileService = new PharmacistProfileService();
  }

  /**
   * プロフィールを取得
   */
  getProfile = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.userType !== 'pharmacist') {
        return res.status(403).json({
          success: false,
          error: '薬剤師アカウントのみアクセス可能です',
        });
      }

      const pharmacistId = BigInt(req.params.pharmacistId);
      console.log(`[Profile] Getting profile for pharmacistId: ${pharmacistId}, userId: ${req.user.id}`);
      
      const profile = await this.profileService.getProfile(pharmacistId);

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      console.error('Get profile error:', error);
      return res.status(404).json({
        success: false,
        error: error.message || 'プロフィールの取得に失敗しました',
      });
    }
  };

  /**
   * プロフィールを更新
   */
  updateProfile = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.userType !== 'pharmacist') {
        return res.status(403).json({
          success: false,
          error: '薬剤師アカウントのみアクセス可能です',
        });
      }

      const pharmacistId = BigInt(req.params.pharmacistId);
      const profile = await this.profileService.updateProfile(
        pharmacistId,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: 'プロフィールを更新しました',
        data: profile,
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'プロフィールの更新に失敗しました',
      });
    }
  };

  /**
   * 証明書をアップロード
   */
  uploadCertificate = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.userType !== 'pharmacist') {
        return res.status(403).json({
          success: false,
          error: '薬剤師アカウントのみアクセス可能です',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'ファイルがアップロードされていません',
        });
      }

      const pharmacistId = BigInt(req.params.pharmacistId);
      const { certificateType } = req.body;

      if (!certificateType || !['license', 'registration'].includes(certificateType)) {
        return res.status(400).json({
          success: false,
          error: '証明書タイプが不正です',
        });
      }

      const certificate = await this.profileService.uploadCertificate(
        pharmacistId,
        certificateType,
        req.file.path,
        req.file.originalname
      );

      return res.status(201).json({
        success: true,
        message: '証明書をアップロードしました',
        data: certificate,
      });
    } catch (error: any) {
      console.error('Upload certificate error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || '証明書のアップロードに失敗しました',
      });
    }
  };

  /**
   * 証明書一覧を取得
   */
  getCertificates = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacistId = BigInt(req.params.pharmacistId);
      const certificates = await this.profileService.getCertificates(pharmacistId);

      return res.status(200).json({
        success: true,
        data: certificates,
      });
    } catch (error: any) {
      console.error('Get certificates error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || '証明書一覧の取得に失敗しました',
      });
    }
  };

  /**
   * 証明書を削除
   */
  deleteCertificate = async (req: AuthRequest, res: Response) => {
    try {
      const certificateId = BigInt(req.params.certificateId);
      const pharmacistId = BigInt(req.params.pharmacistId);

      const result = await this.profileService.deleteCertificate(
        certificateId,
        pharmacistId
      );

      return res.status(200).json({
        success: true,
        message: '証明書を削除しました',
        data: result,
      });
    } catch (error: any) {
      console.error('Delete certificate error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || '証明書の削除に失敗しました',
      });
    }
  };

  /**
   * 証明書確認ステータスを取得
   */
  getVerificationStatus = async (req: AuthRequest, res: Response) => {
    try {
      const pharmacistId = BigInt(req.params.pharmacistId);
      const status = await this.profileService.getVerificationStatus(pharmacistId);

      return res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      console.error('Get verification status error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || '確認ステータスの取得に失敗しました',
      });
    }
  };
}

