import { Response } from 'express';
import { PharmacyBranchService } from '../services/pharmacy-branch.service';
import { AuthRequest } from '../middleware/auth';

const branchService = new PharmacyBranchService();

export class PharmacyBranchController {
  async getBranches(req: AuthRequest, res: Response) {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);
      const branches = await branchService.getBranches(pharmacyId);
      res.json({ success: true, data: branches });
    } catch (error) {
      res.status(500).json({ success: false, error: '薬局一覧の取得に失敗しました' });
    }
  }

  async getBranch(req: AuthRequest, res: Response) {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);
      const branchId = BigInt(req.params.branchId);
      const branch = await branchService.getBranch(branchId, pharmacyId);
      res.json({ success: true, data: branch });
    } catch (error) {
      const msg = error instanceof Error ? error.message : '薬局の取得に失敗しました';
      res.status(404).json({ success: false, error: msg });
    }
  }

  async createBranch(req: AuthRequest, res: Response) {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);
      const branch = await branchService.createBranch(pharmacyId, req.body);
      res.status(201).json({ success: true, data: branch });
    } catch (error) {
      res.status(500).json({ success: false, error: '薬局の追加に失敗しました' });
    }
  }

  async updateBranch(req: AuthRequest, res: Response) {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);
      const branchId = BigInt(req.params.branchId);
      const branch = await branchService.updateBranch(branchId, pharmacyId, req.body);
      res.json({ success: true, data: branch });
    } catch (error) {
      const msg = error instanceof Error ? error.message : '薬局の更新に失敗しました';
      res.status(500).json({ success: false, error: msg });
    }
  }

  async deleteBranch(req: AuthRequest, res: Response) {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);
      const branchId = BigInt(req.params.branchId);
      await branchService.deleteBranch(branchId, pharmacyId);
      res.json({ success: true, message: '薬局を削除しました' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : '薬局の削除に失敗しました';
      res.status(400).json({ success: false, error: msg });
    }
  }
}
