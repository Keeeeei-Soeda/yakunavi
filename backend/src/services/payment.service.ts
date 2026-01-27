import prisma from '../utils/prisma';

interface ReportPaymentInput {
  paymentDate: Date | string;
  transferName: string;
  confirmationNote?: string;
}

export class PaymentService {
  /**
   * 支払い報告（薬局側）
   */
  async reportPayment(paymentId: bigint, pharmacyId: bigint, input: ReportPaymentInput) {
    const { paymentDate, transferName, confirmationNote } = input;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('支払い情報が見つかりません');
    }

    if (payment.pharmacyId !== pharmacyId) {
      throw new Error('この支払いを報告する権限がありません');
    }

    if (payment.paymentStatus !== 'pending') {
      throw new Error('この支払いは既に報告済みです');
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: 'reported',
        paymentDate: typeof paymentDate === 'string' ? new Date(paymentDate) : paymentDate,
        transferName,
        confirmationNote,
        reportedAt: new Date(),
      },
    });

    return {
      ...updatedPayment,
      id: Number(updatedPayment.id),
      contractId: Number(updatedPayment.contractId),
      pharmacyId: Number(updatedPayment.pharmacyId),
    };
  }

  /**
   * 支払い確認（管理者側）
   */
  async confirmPayment(paymentId: bigint) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        contract: true,
      },
    });

    if (!payment) {
      throw new Error('支払い情報が見つかりません');
    }

    if (payment.paymentStatus !== 'reported') {
      throw new Error('支払いが報告されていません');
    }

    // 支払いを確認済みに更新
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: 'confirmed',
        confirmedAt: new Date(),
      },
    });

    // 契約ステータスを更新（手数料支払い完了）
    await prisma.contract.update({
      where: { id: payment.contractId },
      data: {
        status: 'active',
        paymentConfirmedAt: new Date(),
      },
    });

    return {
      ...updatedPayment,
      id: Number(updatedPayment.id),
      contractId: Number(updatedPayment.contractId),
      pharmacyId: Number(updatedPayment.pharmacyId),
    };
  }

  /**
   * 請求書一覧を取得（薬局側）
   */
  async getPaymentsByPharmacy(pharmacyId: bigint, status?: string) {
    const where: any = { pharmacyId };
    if (status) {
      where.paymentStatus = status;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        contract: {
          include: {
            pharmacist: {
              select: {
                id: true,
                lastName: true,
                firstName: true,
              },
            },
            jobPosting: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payments.map((payment) => ({
      ...payment,
      id: Number(payment.id),
      contractId: Number(payment.contractId),
      pharmacyId: Number(payment.pharmacyId),
      contract: {
        ...payment.contract,
        id: Number(payment.contract.id),
        applicationId: Number(payment.contract.applicationId),
        pharmacyId: Number(payment.contract.pharmacyId),
        pharmacistId: Number(payment.contract.pharmacistId),
        jobPostingId: Number(payment.contract.jobPostingId),
        pharmacist: {
          ...payment.contract.pharmacist,
          id: Number(payment.contract.pharmacist.id),
        },
        jobPosting: {
          ...payment.contract.jobPosting,
          id: Number(payment.contract.jobPosting.id),
        },
      },
    }));
  }

  /**
   * 請求書詳細を取得
   */
  async getPaymentById(paymentId: bigint) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        contract: {
          include: {
            pharmacy: true,
            pharmacist: {
              select: {
                id: true,
                lastName: true,
                firstName: true,
                age: true,
                workExperienceYears: true,
              },
            },
            jobPosting: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error('支払い情報が見つかりません');
    }

    return {
      ...payment,
      id: Number(payment.id),
      contractId: Number(payment.contractId),
      pharmacyId: Number(payment.pharmacyId),
      contract: {
        ...payment.contract,
        id: Number(payment.contract.id),
        applicationId: Number(payment.contract.applicationId),
        pharmacyId: Number(payment.contract.pharmacyId),
        pharmacistId: Number(payment.contract.pharmacistId),
        jobPostingId: Number(payment.contract.jobPostingId),
        pharmacy: {
          ...payment.contract.pharmacy,
          id: Number(payment.contract.pharmacy.id),
          userId: Number(payment.contract.pharmacy.userId),
        },
        pharmacist: {
          ...payment.contract.pharmacist,
          id: Number(payment.contract.pharmacist.id),
        },
        jobPosting: {
          ...payment.contract.jobPosting,
          id: Number(payment.contract.jobPosting.id),
          pharmacyId: Number(payment.contract.jobPosting.pharmacyId),
        },
      },
    };
  }

  /**
   * 期限超過の支払いをチェックして自動キャンセル（バッチ処理用）
   */
  async checkOverduePayments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 期限超過の契約を取得
    const overdueContracts = await prisma.contract.findMany({
      where: {
        status: 'pending_payment',
        paymentDeadline: {
          lt: today,
        },
      },
      include: {
        payment: true,
        pharmacy: true,
      },
    });

    const results = [];

    for (const contract of overdueContracts) {
      // 契約をキャンセル
      await prisma.contract.update({
        where: { id: contract.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: '手数料未払いによる自動キャンセル',
        },
      });

      // 支払いステータスを更新
      if (contract.payment) {
        await prisma.payment.update({
          where: { id: contract.payment.id },
          data: {
            paymentStatus: 'overdue',
          },
        });
      }

      // ペナルティレコードを作成
      await prisma.penalty.create({
        data: {
          pharmacyId: contract.pharmacyId,
          contractId: contract.id,
          penaltyType: 'payment_overdue',
          reason: `契約ID ${contract.id} の手数料未払いによる自動キャンセル`,
          penaltyStatus: 'active',
        },
      });

      results.push({
        contractId: Number(contract.id),
        pharmacyId: Number(contract.pharmacyId),
        message: '契約をキャンセルし、ペナルティを適用しました',
      });
    }

    return results;
  }

  /**
   * ペナルティ一覧を取得（薬局側）
   */
  async getPenaltiesByPharmacy(pharmacyId: bigint) {
    const penalties = await prisma.penalty.findMany({
      where: { pharmacyId },
      include: {
        pharmacy: {
          select: {
            id: true,
            pharmacyName: true,
          },
        },
      },
      orderBy: {
        imposedAt: 'desc',
      },
    });

    return penalties.map((penalty: any) => ({
      ...penalty,
      id: Number(penalty.id),
      pharmacyId: Number(penalty.pharmacyId),
      contractId: penalty.contractId ? Number(penalty.contractId) : null,
      pharmacy: {
        ...penalty.pharmacy,
        id: Number(penalty.pharmacy.id),
      },
    }));
  }

  /**
   * ペナルティ解除申請（薬局側）
   */
  async requestPenaltyResolution(penaltyId: bigint, pharmacyId: bigint, note: string) {
    const penalty = await prisma.penalty.findUnique({
      where: { id: penaltyId },
    });

    if (!penalty) {
      throw new Error('ペナルティが見つかりません');
    }

    if (penalty.pharmacyId !== pharmacyId) {
      throw new Error('このペナルティを解除申請する権限がありません');
    }

    if (penalty.penaltyStatus !== 'active') {
      throw new Error('このペナルティは解除申請できません');
    }

    const updatedPenalty = await prisma.penalty.update({
      where: { id: penaltyId },
      data: {
        penaltyStatus: 'resolution_requested',
        resolutionNote: note,
      },
    });

    return {
      ...updatedPenalty,
      id: Number(updatedPenalty.id),
      pharmacyId: Number(updatedPenalty.pharmacyId),
      contractId: updatedPenalty.contractId ? Number(updatedPenalty.contractId) : null,
    };
  }
}

