import { Request, Response } from 'express';
import { ContractService } from '../services/contract.service';

const contractService = new ContractService();

export class ContractController {
    /**
     * 正式オファーを送信（契約を作成）
     * POST /api/contracts
     */
    async createContract(req: Request, res: Response) {
        try {
            const { applicationId, initialWorkDate, workDays, dailyWage, workHours } = req.body;

            if (!applicationId || !initialWorkDate || !workDays || !dailyWage) {
                return res.status(400).json({
                    success: false,
                    error: '必須項目が不足しています',
                });
            }

            const contract = await contractService.createContract({
                applicationId: BigInt(applicationId),
                initialWorkDate,
                workDays,
                dailyWage,
                workHours,
            });

            return res.status(201).json({
                success: true,
                data: contract,
            });
        } catch (error: any) {
            console.error('Create contract error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || '契約の作成に失敗しました',
            });
        }
    }

    /**
     * オファーを承認（薬剤師側）
     * POST /api/contracts/:id/approve
     */
    async approveContract(req: Request, res: Response) {
        try {
            const contractId = BigInt(req.params.id);
            const { pharmacistId } = req.body;

            if (!pharmacistId) {
                return res.status(400).json({
                    success: false,
                    error: '薬剤師IDが必要です',
                });
            }

            const contract = await contractService.approveContract(
                contractId,
                BigInt(pharmacistId)
            );

            return res.json({
                success: true,
                data: contract,
            });
        } catch (error: any) {
            console.error('Approve contract error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || 'オファーの承認に失敗しました',
            });
        }
    }

    /**
     * オファーを辞退（薬剤師側）
     * POST /api/contracts/:id/reject
     */
    async rejectContract(req: Request, res: Response) {
        try {
            const contractId = BigInt(req.params.id);
            const { pharmacistId } = req.body;

            if (!pharmacistId) {
                return res.status(400).json({
                    success: false,
                    error: '薬剤師IDが必要です',
                });
            }

            const result = await contractService.rejectContract(
                contractId,
                BigInt(pharmacistId)
            );

            return res.json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            console.error('Reject contract error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || 'オファーの辞退に失敗しました',
            });
        }
    }

    /**
     * 契約一覧を取得（薬局側）
     * GET /api/contracts/pharmacy/:pharmacyId
     */
    async getContractsByPharmacy(req: Request, res: Response) {
        try {
            const pharmacyId = BigInt(req.params.pharmacyId);
            const status = req.query.status as string | undefined;

            const contracts = await contractService.getContractsByPharmacy(pharmacyId, status);

            return res.json({
                success: true,
                data: contracts,
            });
        } catch (error: any) {
            console.error('Get contracts by pharmacy error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || '契約一覧の取得に失敗しました',
            });
        }
    }

    /**
     * 契約一覧を取得（薬剤師側）
     * GET /api/contracts/pharmacist/:pharmacistId
     */
    async getContractsByPharmacist(req: Request, res: Response) {
        try {
            const pharmacistId = BigInt(req.params.pharmacistId);
            const status = req.query.status as string | undefined;

            const contracts = await contractService.getContractsByPharmacist(pharmacistId, status);

            return res.json({
                success: true,
                data: contracts,
            });
        } catch (error: any) {
            console.error('Get contracts by pharmacist error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || '契約一覧の取得に失敗しました',
            });
        }
    }

    /**
     * 応募IDから契約を取得
     * GET /api/contracts/application/:applicationId
     */
    async getContractByApplicationId(req: Request, res: Response) {
        try {
            const applicationId = BigInt(req.params.applicationId);

            const contract = await contractService.getContractByApplicationId(applicationId);

            if (!contract) {
                return res.json({
                    success: true,
                    data: null,
                });
            }

            return res.json({
                success: true,
                data: contract,
            });
        } catch (error: any) {
            console.error('Get contract by application id error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || '契約の取得に失敗しました',
            });
        }
    }

    /**
     * 契約詳細を取得
     * GET /api/contracts/:id
     */
    async getContractById(req: Request, res: Response) {
        try {
            const contractId = BigInt(req.params.id);

            const contract = await contractService.getContractById(contractId);

            return res.json({
                success: true,
                data: contract,
            });
        } catch (error: any) {
            console.error('Get contract by id error:', error);
            return res.status(404).json({
                success: false,
                error: error.message || '契約の取得に失敗しました',
            });
        }
    }

    /**
     * 採用済み薬剤師のプロフィール一覧を取得（薬局側）
     * GET /api/contracts/pharmacy/:pharmacyId/hired-pharmacists
     */
    async getHiredPharmacists(req: Request, res: Response) {
        try {
            const pharmacyId = BigInt(req.params.pharmacyId);

            const pharmacists = await contractService.getHiredPharmacists(pharmacyId);

            return res.json({
                success: true,
                data: pharmacists,
            });
        } catch (error: any) {
            console.error('Get hired pharmacists error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || '採用済み薬剤師の取得に失敗しました',
            });
        }
    }
}

