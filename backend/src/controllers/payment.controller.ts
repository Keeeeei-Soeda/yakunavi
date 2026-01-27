import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';

const paymentService = new PaymentService();

export class PaymentController {
  /**
   * 支払い報告（薬局側）
   * POST /api/payments/:id/report
   */
  async reportPayment(req: Request, res: Response) {
    try {
      const paymentId = BigInt(req.params.id);
      const { pharmacyId, paymentDate, transferName, confirmationNote } = req.body;

      if (!pharmacyId || !paymentDate || !transferName) {
        return res.status(400).json({
          success: false,
          error: '必須項目が不足しています',
        });
      }

      const payment = await paymentService.reportPayment(
        paymentId,
        BigInt(pharmacyId),
        {
          paymentDate,
          transferName,
          confirmationNote,
        }
      );

      return res.json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      console.error('Report payment error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || '支払い報告に失敗しました',
      });
    }
  }

  /**
   * 支払い確認（管理者側）
   * POST /api/payments/:id/confirm
   */
  async confirmPayment(req: Request, res: Response) {
    try {
      const paymentId = BigInt(req.params.id);

      const payment = await paymentService.confirmPayment(paymentId);

      return res.json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      console.error('Confirm payment error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || '支払い確認に失敗しました',
      });
    }
  }

  /**
   * 請求書一覧を取得（薬局側）
   * GET /api/payments/pharmacy/:pharmacyId
   */
  async getPaymentsByPharmacy(req: Request, res: Response) {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);
      const status = req.query.status as string | undefined;

      const payments = await paymentService.getPaymentsByPharmacy(pharmacyId, status);

      return res.json({
        success: true,
        data: payments,
      });
    } catch (error: any) {
      console.error('Get payments by pharmacy error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || '請求書一覧の取得に失敗しました',
      });
    }
  }

  /**
   * 請求書詳細を取得
   * GET /api/payments/:id
   */
  async getPaymentById(req: Request, res: Response) {
    try {
      const paymentId = BigInt(req.params.id);

      const payment = await paymentService.getPaymentById(paymentId);

      return res.json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      console.error('Get payment by id error:', error);
      return res.status(404).json({
        success: false,
        error: error.message || '請求書の取得に失敗しました',
      });
    }
  }

  /**
   * 期限超過の支払いをチェック（バッチ処理用）
   * POST /api/payments/check-overdue
   */
  async checkOverduePayments(req: Request, res: Response) {
    try {
      const results = await paymentService.checkOverduePayments();

      return res.json({
        success: true,
        data: results,
        message: `${results.length}件の契約をキャンセルしました`,
      });
    } catch (error: any) {
      console.error('Check overdue payments error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || '期限超過チェックに失敗しました',
      });
    }
  }

  /**
   * ペナルティ一覧を取得（薬局側）
   * GET /api/payments/pharmacy/:pharmacyId/penalties
   */
  async getPenaltiesByPharmacy(req: Request, res: Response) {
    try {
      const pharmacyId = BigInt(req.params.pharmacyId);

      const penalties = await paymentService.getPenaltiesByPharmacy(pharmacyId);

      return res.json({
        success: true,
        data: penalties,
      });
    } catch (error: any) {
      console.error('Get penalties by pharmacy error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'ペナルティ一覧の取得に失敗しました',
      });
    }
  }

  /**
   * ペナルティ解除申請（薬局側）
   * POST /api/payments/penalties/:id/request-resolution
   */
  async requestPenaltyResolution(req: Request, res: Response) {
    try {
      const penaltyId = BigInt(req.params.id);
      const { pharmacyId, note } = req.body;

      if (!pharmacyId || !note) {
        return res.status(400).json({
          success: false,
          error: '必須項目が不足しています',
        });
      }

      const penalty = await paymentService.requestPenaltyResolution(
        penaltyId,
        BigInt(pharmacyId),
        note
      );

      return res.json({
        success: true,
        data: penalty,
      });
    } catch (error: any) {
      console.error('Request penalty resolution error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'ペナルティ解除申請に失敗しました',
      });
    }
  }
}

