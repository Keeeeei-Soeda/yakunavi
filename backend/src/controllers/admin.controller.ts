import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

const adminService = new AdminService();

export class AdminController {
    /**
     * ダッシュボード統計取得
     * GET /api/admin/dashboard/stats
     */
    async getDashboardStats(_req: Request, res: Response) {
        try {
            const stats = await adminService.getDashboardStats();

            return res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error: any) {
            console.error('Get dashboard stats error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'ダッシュボード統計の取得に失敗しました',
            });
        }
    }

    /**
     * 資格証明書一覧取得
     * GET /api/admin/certificates
     */
    async getCertificates(req: Request, res: Response) {
        try {
            const { page, limit, status, search } = req.query;

            const result = await adminService.getCertificates({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                status: status as string,
                search: search as string,
            });

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error: any) {
            console.error('Get certificates error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || '資格証明書一覧の取得に失敗しました',
            });
        }
    }

    /**
     * 資格証明書承認
     * POST /api/admin/certificates/:id/approve
     */
    async approveCertificate(req: AuthRequest, res: Response) {
        try {
            const certificateId = BigInt(req.params.id);
            const adminId = BigInt(req.user!.id);
            const { comment } = req.body;

            const result = await adminService.approveCertificate(certificateId, adminId, comment);

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            console.error('Approve certificate error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || '資格証明書の承認に失敗しました',
            });
        }
    }

    /**
     * 資格証明書差し戻し
     * POST /api/admin/certificates/:id/reject
     */
    async rejectCertificate(req: Request, res: Response) {
        try {
            const certificateId = BigInt(req.params.id);
            const { reason } = req.body;

            if (!reason) {
                return res.status(400).json({
                    success: false,
                    error: '差し戻し理由が必要です',
                });
            }

            const result = await adminService.rejectCertificate(certificateId, reason);

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            console.error('Reject certificate error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || '資格証明書の差し戻しに失敗しました',
            });
        }
    }

    /**
     * 契約一覧取得
     * GET /api/admin/contracts
     */
    async getContracts(req: Request, res: Response) {
        try {
            const { page, limit, status, search, startDate, endDate } = req.query;

            const result = await adminService.getContracts({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                status: status as string,
                search: search as string,
                startDate: startDate as string,
                endDate: endDate as string,
            });

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error: any) {
            console.error('Get contracts error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || '契約一覧の取得に失敗しました',
            });
        }
    }

    /**
     * 支払い一覧取得
     * GET /api/admin/payments
     */
    async getPayments(req: Request, res: Response) {
        try {
            const { page, limit, status, search } = req.query;

            const result = await adminService.getPayments({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                status: status as string,
                search: search as string,
            });

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error: any) {
            console.error('Get payments error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || '支払い一覧の取得に失敗しました',
            });
        }
    }

    /**
     * 支払い確認
     * POST /api/admin/payments/:id/confirm
     */
    async confirmPayment(req: Request, res: Response) {
        try {
            const paymentId = BigInt(req.params.id);

            const payment = await prisma.payment.findUnique({
                where: { id: paymentId },
            });

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    error: '支払いが見つかりません',
                });
            }

            if (payment.paymentStatus !== 'reported') {
                return res.status(400).json({
                    success: false,
                    error: 'この支払いは確認できません',
                });
            }

            const updatedPayment = await prisma.payment.update({
                where: { id: paymentId },
                data: {
                    paymentStatus: 'confirmed',
                    confirmedAt: new Date(),
                },
            });

            return res.status(200).json({
                success: true,
                data: {
                    id: Number(updatedPayment.id),
                    paymentStatus: updatedPayment.paymentStatus,
                    confirmedAt: updatedPayment.confirmedAt,
                },
            });
        } catch (error: any) {
            console.error('Confirm payment error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || '支払いの確認に失敗しました',
            });
        }
    }

    /**
     * ペナルティ一覧取得
     * GET /api/admin/penalties
     */
    async getPenalties(req: Request, res: Response) {
        try {
            const { page, limit, status, search } = req.query;

            const result = await adminService.getPenalties({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                status: status as string,
                search: search as string,
            });

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error: any) {
            console.error('Get penalties error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'ペナルティ一覧の取得に失敗しました',
            });
        }
    }

    /**
     * ペナルティ解除
     * POST /api/admin/penalties/:id/resolve
     */
    async resolvePenalty(req: Request, res: Response) {
        try {
            const penaltyId = BigInt(req.params.id);
            const { resolutionNote } = req.body;

            const result = await adminService.resolvePenalty(penaltyId, resolutionNote);

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            console.error('Resolve penalty error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || 'ペナルティの解除に失敗しました',
            });
        }
    }

    /**
     * 統計データ取得
     * GET /api/admin/statistics
     */
    async getStatistics(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;

            const stats = await adminService.getStatistics(startDate as string, endDate as string);

            return res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error: any) {
            console.error('Get statistics error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || '統計データの取得に失敗しました',
            });
        }
    }

    /**
     * 求人一覧取得
     * GET /api/admin/job-postings
     */
    async getJobPostings(req: Request, res: Response) {
        try {
            const { page, limit, status, search } = req.query;

            const result = await adminService.getJobPostings({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                status: status as string,
                search: search as string,
            });

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error: any) {
            console.error('Get job postings error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || '求人一覧の取得に失敗しました',
            });
        }
    }

    /**
     * 応募一覧取得
     * GET /api/admin/applications
     */
    async getApplications(req: Request, res: Response) {
        try {
            const { page, limit, status, search } = req.query;

            const result = await adminService.getApplications({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                status: status as string,
                search: search as string,
            });

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error: any) {
            console.error('Get applications error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || '応募一覧の取得に失敗しました',
            });
        }
    }

    /**
     * 薬剤師一覧取得
     * GET /api/admin/pharmacists
     */
    async getPharmacists(req: Request, res: Response) {
        try {
            const { page, limit, status, search } = req.query;

            const result = await adminService.getPharmacists({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                status: status as string,
                search: search as string,
            });

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error: any) {
            console.error('Get pharmacists error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || '薬剤師一覧の取得に失敗しました',
            });
        }
    }

    /**
     * 薬局一覧取得
     * GET /api/admin/pharmacies
     */
    async getPharmacies(req: Request, res: Response) {
        try {
            const { page, limit, status, search } = req.query;

            const result = await adminService.getPharmacies({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                status: status as string,
                search: search as string,
            });

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error: any) {
            console.error('Get pharmacies error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || '薬局一覧の取得に失敗しました',
            });
        }
    }

    /**
     * 薬局詳細取得
     * GET /api/admin/pharmacies/:id
     */
    async getPharmacyById(req: Request, res: Response) {
        try {
            const pharmacyId = BigInt(req.params.id);

            const pharmacy = await adminService.getPharmacyById(pharmacyId);

            return res.status(200).json({
                success: true,
                data: pharmacy,
            });
        } catch (error: any) {
            console.error('Get pharmacy by id error:', error);
            return res.status(404).json({
                success: false,
                error: error.message || '薬局が見つかりません',
            });
        }
    }

    /**
     * 薬剤師詳細取得
     * GET /api/admin/pharmacists/:id
     */
    async getPharmacistById(req: Request, res: Response) {
        try {
            const pharmacistId = BigInt(req.params.id);

            const pharmacist = await adminService.getPharmacistById(pharmacistId);

            return res.status(200).json({
                success: true,
                data: pharmacist,
            });
        } catch (error: any) {
            console.error('Get pharmacist by id error:', error);
            return res.status(404).json({
                success: false,
                error: error.message || '薬剤師が見つかりません',
            });
        }
    }

    /**
     * アカウントステータス変更
     * POST /api/admin/users/:id/toggle-status
     */
    async toggleUserStatus(req: Request, res: Response) {
        try {
            const userId = BigInt(req.params.id);

            // 現在のユーザー情報を取得
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'ユーザーが見つかりません',
                });
            }

            // ステータスを反転
            const result = await adminService.toggleUserStatus(userId, !user.isActive);

            return res.status(200).json({
                success: true,
                data: result,
                message: user.isActive ? 'アカウントを停止しました' : 'アカウントを有効化しました',
            });
        } catch (error: any) {
            console.error('Toggle user status error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || 'アカウントステータスの変更に失敗しました',
            });
        }
    }
}

