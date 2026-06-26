import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import fs from 'fs';
import path from 'path';

const adminService = new AdminService();

function getClientIp(req: Request): string | undefined {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress ?? undefined;
}

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
     * 支払い詳細を取得
     * GET /api/admin/payments/:id
     */
    async getPaymentById(req: Request, res: Response) {
        try {
            const paymentId = BigInt(req.params.id);
            const payment = await adminService.getPaymentById(paymentId);

            return res.status(200).json({
                success: true,
                data: payment,
            });
        } catch (error: any) {
            console.error('Get payment by id error:', error);
            return res.status(404).json({
                success: false,
                error: error.message || '支払い情報の取得に失敗しました',
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
            const paymentService = new (await import('../services/payment.service')).PaymentService();

            const updatedPayment = await paymentService.confirmPayment(paymentId);

            return res.status(200).json({
                success: true,
                data: {
                    id: updatedPayment.id,
                    contractId: updatedPayment.contractId,
                    paymentStatus: updatedPayment.paymentStatus,
                    confirmedAt: updatedPayment.confirmedAt,
                },
                message: '支払いを確認しました。契約ステータスを「勤務中」に更新しました。',
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

    /**
     * 監査ログ一覧取得
     * GET /api/admin/audit-logs
     */
    async getAuditLogs(req: Request, res: Response) {
        try {
            const { page, limit, resourceType, pharmacyId, action } = req.query;

            const result = await adminService.getAuditLogs({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                resourceType: resourceType as string,
                pharmacyId: pharmacyId ? BigInt(pharmacyId as string) : undefined,
                action: action as string,
            });

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error: any) {
            console.error('Get audit logs error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || '監査ログの取得に失敗しました',
            });
        }
    }

    /**
     * 薬局の店舗一覧取得
     * GET /api/admin/pharmacies/:pharmacyId/branches
     */
    async getPharmacyBranches(req: Request, res: Response) {
        try {
            const pharmacyId = BigInt(req.params.pharmacyId);
            const branches = await adminService.getPharmacyBranches(pharmacyId);

            return res.status(200).json({
                success: true,
                data: branches,
            });
        } catch (error: any) {
            console.error('Get pharmacy branches error:', error);
            return res.status(404).json({
                success: false,
                error: error.message || '店舗一覧の取得に失敗しました',
            });
        }
    }

    /**
     * 薬局のおためし案件一覧取得
     * GET /api/admin/pharmacies/:pharmacyId/job-postings
     */
    async getPharmacyJobPostings(req: Request, res: Response) {
        try {
            const pharmacyId = BigInt(req.params.pharmacyId);
            const jobPostings = await adminService.getPharmacyJobPostings(pharmacyId);

            return res.status(200).json({
                success: true,
                data: jobPostings,
            });
        } catch (error: any) {
            console.error('Get pharmacy job postings error:', error);
            return res.status(404).json({
                success: false,
                error: error.message || 'おためし案件一覧の取得に失敗しました',
            });
        }
    }

    /**
     * おためし案件詳細取得
     * GET /api/admin/job-postings/:id
     */
    async getJobPostingById(req: Request, res: Response) {
        try {
            const jobPostingId = BigInt(req.params.id);
            const jobPosting = await adminService.getJobPostingById(jobPostingId);

            return res.status(200).json({
                success: true,
                data: jobPosting,
            });
        } catch (error: any) {
            console.error('Get job posting by id error:', error);
            return res.status(404).json({
                success: false,
                error: error.message || 'おためし案件が見つかりません',
            });
        }
    }

    /**
     * おためし案件代行作成
     * POST /api/admin/pharmacies/:pharmacyId/job-postings
     */
    async createJobPostingForPharmacy(req: AuthRequest, res: Response) {
        try {
            const pharmacyId = BigInt(req.params.pharmacyId);
            const adminUserId = BigInt(req.user!.id);

            const jobPosting = await adminService.createJobPostingForPharmacy(
                pharmacyId,
                adminUserId,
                req.body,
                getClientIp(req)
            );

            return res.status(201).json({
                success: true,
                message: 'おためし案件を作成しました',
                data: jobPosting,
            });
        } catch (error: any) {
            console.error('Create job posting for pharmacy error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || 'おためし案件の作成に失敗しました',
            });
        }
    }

    /**
     * おためし案件代行更新
     * PUT /api/admin/job-postings/:id
     */
    async updateJobPostingForPharmacy(req: AuthRequest, res: Response) {
        try {
            const jobPostingId = BigInt(req.params.id);
            const adminUserId = BigInt(req.user!.id);

            const jobPosting = await adminService.updateJobPostingForPharmacy(
                jobPostingId,
                adminUserId,
                req.body,
                getClientIp(req)
            );

            return res.status(200).json({
                success: true,
                message: 'おためし案件を更新しました',
                data: jobPosting,
            });
        } catch (error: any) {
            console.error('Update job posting for pharmacy error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || 'おためし案件の更新に失敗しました',
            });
        }
    }

    /**
     * おためし案件代行公開
     * POST /api/admin/job-postings/:id/publish
     */
    async publishJobPostingForPharmacy(req: AuthRequest, res: Response) {
        try {
            const jobPostingId = BigInt(req.params.id);
            const adminUserId = BigInt(req.user!.id);

            const jobPosting = await adminService.publishJobPostingForPharmacy(
                jobPostingId,
                adminUserId,
                getClientIp(req)
            );

            return res.status(200).json({
                success: true,
                message: 'おためし案件を公開しました',
                data: jobPosting,
            });
        } catch (error: any) {
            console.error('Publish job posting for pharmacy error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || 'おためし案件の公開に失敗しました',
            });
        }
    }

    /**
     * おためし案件代行非公開
     * POST /api/admin/job-postings/:id/unpublish
     */
    async unpublishJobPostingForPharmacy(req: AuthRequest, res: Response) {
        try {
            const jobPostingId = BigInt(req.params.id);
            const adminUserId = BigInt(req.user!.id);

            const jobPosting = await adminService.unpublishJobPostingForPharmacy(
                jobPostingId,
                adminUserId,
                getClientIp(req)
            );

            return res.status(200).json({
                success: true,
                message: 'おためし案件を非公開にしました',
                data: jobPosting,
            });
        } catch (error: any) {
            console.error('Unpublish job posting for pharmacy error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || 'おためし案件の非公開化に失敗しました',
            });
        }
    }

    /**
     * おためし案件代行削除
     * DELETE /api/admin/job-postings/:id
     */
    async deleteJobPostingForPharmacy(req: AuthRequest, res: Response) {
        try {
            const jobPostingId = BigInt(req.params.id);
            const adminUserId = BigInt(req.user!.id);

            await adminService.deleteJobPostingForPharmacy(
                jobPostingId,
                adminUserId,
                getClientIp(req)
            );

            return res.status(200).json({
                success: true,
                message: 'おためし案件を削除しました',
            });
        } catch (error: any) {
            console.error('Delete job posting for pharmacy error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || 'おためし案件の削除に失敗しました',
            });
        }
    }

    /**
     * 証明書ファイルを表示/ダウンロード
     * GET /api/admin/certificates/:id/file
     */
    async getCertificateFile(req: Request, res: Response) {
        try {
            const certificateId = BigInt(req.params.id);

            const certificate = await prisma.certificate.findUnique({
                where: { id: certificateId },
            });

            if (!certificate) {
                return res.status(404).json({
                    success: false,
                    error: '証明書が見つかりません',
                });
            }

            // ファイルの絶対パスを取得
            const filePath = path.isAbsolute(certificate.filePath)
                ? certificate.filePath
                : path.join(process.cwd(), certificate.filePath);

            // ファイルが存在するか確認
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    success: false,
                    error: 'ファイルが見つかりません',
                });
            }

            // Content-Typeを設定
            const ext = path.extname(filePath).toLowerCase();
            let contentType = 'application/octet-stream';
            if (ext === '.pdf') {
                contentType = 'application/pdf';
            } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.jpe' || ext === '.jfif') {
                contentType = 'image/jpeg';
            } else if (ext === '.png') {
                contentType = 'image/png';
            } else if (ext === '.heic' || ext === '.heif') {
                // HEIC/HEIFは変換済みのため、通常はJPEGとして扱われるが、念のため対応
                contentType = 'image/jpeg';
            } else if (ext === '.webp') {
                contentType = 'image/webp';
            }

            // インライン表示（ブラウザで開く）
            res.setHeader('Content-Type', contentType);
            res.setHeader(
                'Content-Disposition',
                `inline; filename*=UTF-8''${encodeURIComponent(certificate.fileName)}`
            );

            // ファイルをストリームとして送信
            const fileStream = fs.createReadStream(filePath);
            fileStream.on('error', (error) => {
                console.error('File stream error:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        error: 'ファイルの読み込みに失敗しました',
                    });
                }
            });
            fileStream.pipe(res);
            return;
        } catch (error: any) {
            console.error('Get certificate file error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'ファイルの取得に失敗しました',
            });
        }
    }
}

