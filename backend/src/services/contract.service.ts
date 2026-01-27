import prisma from '../utils/prisma';
// import { PDFService } from './pdf.service';

interface CreateContractInput {
    applicationId: bigint;
    initialWorkDate: Date | string;
    workDays: number;
    dailyWage: number;
    workHours?: string;
}

export class ContractService {
    // private pdfService: PDFService;

    constructor() {
        // this.pdfService = new PDFService();
    }

    /**
     * 正式オファーを送信（契約を作成）
     */
    async createContract(input: CreateContractInput) {
        const { applicationId, initialWorkDate, workDays, dailyWage, workHours } = input;

        // 応募情報を取得
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                jobPosting: {
                    include: {
                        pharmacy: true,
                    },
                },
                pharmacist: true,
            },
        });

        if (!application) {
            throw new Error('応募が見つかりません');
        }

        // 既に契約が存在するかチェック
        const existingContract = await prisma.contract.findUnique({
            where: { applicationId },
        });

        if (existingContract) {
            throw new Error('既にこの応募に対する契約が存在します');
        }

        // 報酬総額とプラットフォーム手数料を計算
        const totalCompensation = dailyWage * workDays;
        const platformFee = Math.floor(totalCompensation * 0.4); // 40%

        // 支払い期限を計算（初回出勤日の3日前）
        const workDate = typeof initialWorkDate === 'string' ? new Date(initialWorkDate) : initialWorkDate;
        const paymentDeadline = new Date(workDate);
        paymentDeadline.setDate(paymentDeadline.getDate() - 3);

        // 契約を作成
        const contract = await prisma.contract.create({
            data: {
                applicationId,
                pharmacyId: application.jobPosting.pharmacyId,
                pharmacistId: application.pharmacistId,
                jobPostingId: application.jobPostingId,
                initialWorkDate: workDate,
                workDays,
                dailyWage,
                totalCompensation,
                platformFee,
                workHours,
                status: 'pending_approval', // 薬剤師の承認待ち
                paymentDeadline,
            },
            include: {
                application: {
                    include: {
                        jobPosting: {
                            include: {
                                pharmacy: true,
                            },
                        },
                        pharmacist: true,
                    },
                },
            },
        });

        // 応募ステータスを更新
        await prisma.application.update({
            where: { id: applicationId },
            data: {
                status: 'offered',
                offeredAt: new Date(),
            },
        });

        return {
            ...contract,
            id: Number(contract.id),
            applicationId: Number(contract.applicationId),
            pharmacyId: Number(contract.pharmacyId),
            pharmacistId: Number(contract.pharmacistId),
            jobPostingId: Number(contract.jobPostingId),
        };
    }

    /**
     * オファーを承認（薬剤師側）
     */
    async approveContract(contractId: bigint, pharmacistId: bigint) {
        const contract = await prisma.contract.findUnique({
            where: { id: contractId },
            include: {
                pharmacy: true,
                pharmacist: true,
                application: {
                    include: {
                        jobPosting: true,
                    },
                },
            },
        });

        if (!contract) {
            throw new Error('契約が見つかりません');
        }

        if (contract.pharmacistId !== pharmacistId) {
            throw new Error('この契約を承認する権限がありません');
        }

        if (contract.status !== 'pending_approval') {
            throw new Error('この契約は承認できません');
        }

        // 契約ステータスを更新
        const updatedContract = await prisma.contract.update({
            where: { id: contractId },
            data: {
                status: 'pending_payment', // 手数料支払い待ち
                approvedAt: new Date(),
            },
        });

        // 応募ステータスを更新
        await prisma.application.update({
            where: { id: contract.applicationId },
            data: {
                status: 'accepted',
                respondedAt: new Date(),
            },
        });

        // 支払いレコードを作成
        const payment = await prisma.payment.create({
            data: {
                contractId,
                pharmacyId: contract.pharmacyId,
                amount: contract.platformFee,
                paymentType: 'platform_fee',
                paymentStatus: 'pending',
            },
        });

        // 労働条件通知書を生成
        // TODO: PDF生成機能は今後実装予定
        // try {
        //   const laborConditionsPath = await this.pdfService.generateLaborConditionsNotice({
        //     contractId: Number(contractId),
        //     pharmacyName: contract.pharmacy.pharmacyName,
        //     pharmacyAddress: contract.pharmacy.address || '',
        //     pharmacyPhone: contract.pharmacy.phoneNumber || '',
        //     pharmacyRepresentative: `${contract.pharmacy.representativeLastName} ${contract.pharmacy.representativeFirstName}`,
        //     pharmacistName: `${contract.pharmacist.lastName} ${contract.pharmacist.firstName}`,
        //     pharmacistAddress: contract.pharmacist.address || '',
        //     pharmacistPhone: contract.pharmacist.phoneNumber || '',
        //     jobTitle: '薬剤師',
        //     workLocation: contract.application?.jobPosting?.workLocation || '',
        //     initialWorkDate: new Date(contract.initialWorkDate),
        //     workDays: contract.workDays,
        //     dailyWage: contract.dailyWage,
        //     totalCompensation: contract.totalCompensation,
        //     workHours: contract.workHours || '9:00-18:00',
        //     contractDate: new Date(),
        //   });

        //   // Documentレコードを作成
        //   await prisma.document.create({
        //     data: {
        //       contractId,
        //       pharmacyId: contract.pharmacyId,
        //       pharmacistId: contract.pharmacistId,
        //       documentType: 'labor_conditions',
        //       documentTitle: '労働条件通知書',
        //       filePath: laborConditionsPath,
        //       fileSize: null,
        //     },
        //   });
        // } catch (error) {
        //   console.error('Failed to generate labor conditions notice:', error);
        // }

        // 請求書を生成
        // TODO: PDF生成機能は今後実装予定
        // try {
        //   const invoiceNumber = `INV-${String(contractId).padStart(6, '0')}`;
        //   const invoicePath = await this.pdfService.generateInvoice({
        //     invoiceNumber,
        //     contractId: Number(contractId),
        //     pharmacyName: contract.pharmacy.pharmacyName,
        //     pharmacyAddress: contract.pharmacy.address || '',
        //     issueDate: new Date(),
        //     paymentDeadline: new Date(contract.paymentDeadline),
        //     dailyWage: contract.dailyWage,
        //     workDays: contract.workDays,
        //     totalCompensation: contract.totalCompensation,
        //     platformFee: contract.platformFee,
        //     initialWorkDate: new Date(contract.initialWorkDate),
        //     pharmacistName: `${contract.pharmacist.lastName} ${contract.pharmacist.firstName}`,
        //   });

        //   // Documentレコードを作成
        //   await prisma.document.create({
        //     data: {
        //       contractId,
        //       pharmacyId: contract.pharmacyId,
        //       documentType: 'invoice',
        //       documentTitle: `請求書 ${invoiceNumber}`,
        //       filePath: invoicePath,
        //       fileSize: null,
        //     },
        //   });
        // } catch (error) {
        //   console.error('Failed to generate invoice:', error);
        // }

        return {
            ...updatedContract,
            id: Number(updatedContract.id),
            applicationId: Number(updatedContract.applicationId),
            pharmacyId: Number(updatedContract.pharmacyId),
            pharmacistId: Number(updatedContract.pharmacistId),
            jobPostingId: Number(updatedContract.jobPostingId),
        };
    }

    /**
     * オファーを辞退（薬剤師側）
     */
    async rejectContract(contractId: bigint, pharmacistId: bigint) {
        const contract = await prisma.contract.findUnique({
            where: { id: contractId },
        });

        if (!contract) {
            throw new Error('契約が見つかりません');
        }

        if (contract.pharmacistId !== pharmacistId) {
            throw new Error('この契約を辞退する権限がありません');
        }

        if (contract.status !== 'pending_approval') {
            throw new Error('この契約は辞退できません');
        }

        // 契約をキャンセル
        await prisma.contract.update({
            where: { id: contractId },
            data: {
                status: 'cancelled',
                cancelledAt: new Date(),
                cancellationReason: '薬剤師によるオファー辞退',
            },
        });

        // 応募ステータスを更新
        await prisma.application.update({
            where: { id: contract.applicationId },
            data: {
                status: 'rejected',
                respondedAt: new Date(),
            },
        });

        return { success: true, message: 'オファーを辞退しました' };
    }

    /**
     * 契約一覧を取得（薬局側）
     */
    async getContractsByPharmacy(pharmacyId: bigint, status?: string) {
        const where: any = { pharmacyId };
        if (status) {
            where.status = status;
        }

        const contracts = await prisma.contract.findMany({
            where,
            include: {
                pharmacist: {
                    select: {
                        id: true,
                        lastName: true,
                        firstName: true,
                        age: true,
                        workExperienceYears: true,
                    },
                },
                jobPosting: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                application: {
                    select: {
                        id: true,
                        appliedAt: true,
                    },
                },
                payment: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return contracts.map((contract) => ({
            ...contract,
            id: Number(contract.id),
            applicationId: Number(contract.applicationId),
            pharmacyId: Number(contract.pharmacyId),
            pharmacistId: Number(contract.pharmacistId),
            jobPostingId: Number(contract.jobPostingId),
            pharmacist: {
                ...contract.pharmacist,
                id: Number(contract.pharmacist.id),
            },
            jobPosting: {
                ...contract.jobPosting,
                id: Number(contract.jobPosting.id),
            },
            application: {
                ...contract.application,
                id: Number(contract.application.id),
            },
            payment: contract.payment
                ? {
                    ...contract.payment,
                    id: Number(contract.payment.id),
                    contractId: Number(contract.payment.contractId),
                    pharmacyId: Number(contract.payment.pharmacyId),
                }
                : null,
        }));
    }

    /**
     * 契約一覧を取得（薬剤師側）
     */
    async getContractsByPharmacist(pharmacistId: bigint, status?: string) {
        const where: any = { pharmacistId };
        if (status) {
            where.status = status;
        }

        const contracts = await prisma.contract.findMany({
            where,
            include: {
                pharmacy: {
                    select: {
                        id: true,
                        pharmacyName: true,
                        address: true,
                        phoneNumber: true,
                    },
                },
                jobPosting: {
                    select: {
                        id: true,
                        title: true,
                        workLocation: true,
                    },
                },
                application: {
                    select: {
                        id: true,
                        appliedAt: true,
                    },
                },
                payment: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return contracts.map((contract) => ({
            ...contract,
            id: Number(contract.id),
            applicationId: Number(contract.applicationId),
            pharmacyId: Number(contract.pharmacyId),
            pharmacistId: Number(contract.pharmacistId),
            jobPostingId: Number(contract.jobPostingId),
            pharmacy: {
                ...contract.pharmacy,
                id: Number(contract.pharmacy.id),
            },
            jobPosting: {
                ...contract.jobPosting,
                id: Number(contract.jobPosting.id),
            },
            application: {
                ...contract.application,
                id: Number(contract.application.id),
            },
            payment: contract.payment
                ? {
                    ...contract.payment,
                    id: Number(contract.payment.id),
                    contractId: Number(contract.payment.contractId),
                    pharmacyId: Number(contract.payment.pharmacyId),
                }
                : null,
        }));
    }

    /**
     * 応募IDから契約を取得
     */
    async getContractByApplicationId(applicationId: bigint) {
        const contract = await prisma.contract.findUnique({
            where: { applicationId },
            include: {
                pharmacy: true,
                pharmacist: true,
                jobPosting: true,
                application: true,
                payment: true,
                documents: true,
            },
        });

        if (!contract) {
            return null;
        }

        return {
            ...contract,
            id: Number(contract.id),
            applicationId: Number(contract.applicationId),
            pharmacyId: Number(contract.pharmacyId),
            pharmacistId: Number(contract.pharmacistId),
            jobPostingId: Number(contract.jobPostingId),
            pharmacy: {
                ...contract.pharmacy,
                id: Number(contract.pharmacy.id),
                userId: Number(contract.pharmacy.userId),
            },
            pharmacist: {
                ...contract.pharmacist,
                id: Number(contract.pharmacist.id),
                userId: Number(contract.pharmacist.userId),
            },
            jobPosting: {
                ...contract.jobPosting,
                id: Number(contract.jobPosting.id),
                pharmacyId: Number(contract.jobPosting.pharmacyId),
            },
            application: {
                ...contract.application,
                id: Number(contract.application.id),
                jobPostingId: Number(contract.application.jobPostingId),
                pharmacistId: Number(contract.application.pharmacistId),
            },
            payment: contract.payment
                ? {
                    ...contract.payment,
                    id: Number(contract.payment.id),
                    contractId: Number(contract.payment.contractId),
                    pharmacyId: Number(contract.payment.pharmacyId),
                }
                : null,
            documents: contract.documents.map((doc) => ({
                ...doc,
                id: Number(doc.id),
                contractId: doc.contractId ? Number(doc.contractId) : null,
                pharmacyId: doc.pharmacyId ? Number(doc.pharmacyId) : null,
                pharmacistId: doc.pharmacistId ? Number(doc.pharmacistId) : null,
            })),
        };
    }

    /**
     * 契約詳細を取得
     */
    async getContractById(contractId: bigint) {
        const contract = await prisma.contract.findUnique({
            where: { id: contractId },
            include: {
                pharmacy: true,
                pharmacist: true,
                jobPosting: true,
                application: true,
                payment: true,
                documents: true,
            },
        });

        if (!contract) {
            throw new Error('契約が見つかりません');
        }

        return {
            ...contract,
            id: Number(contract.id),
            applicationId: Number(contract.applicationId),
            pharmacyId: Number(contract.pharmacyId),
            pharmacistId: Number(contract.pharmacistId),
            jobPostingId: Number(contract.jobPostingId),
            pharmacy: {
                ...contract.pharmacy,
                id: Number(contract.pharmacy.id),
                userId: Number(contract.pharmacy.userId),
            },
            pharmacist: {
                ...contract.pharmacist,
                id: Number(contract.pharmacist.id),
                userId: Number(contract.pharmacist.userId),
            },
            jobPosting: {
                ...contract.jobPosting,
                id: Number(contract.jobPosting.id),
                pharmacyId: Number(contract.jobPosting.pharmacyId),
            },
            application: {
                ...contract.application,
                id: Number(contract.application.id),
                jobPostingId: Number(contract.application.jobPostingId),
                pharmacistId: Number(contract.application.pharmacistId),
            },
            payment: contract.payment
                ? {
                    ...contract.payment,
                    id: Number(contract.payment.id),
                    contractId: Number(contract.payment.contractId),
                    pharmacyId: Number(contract.payment.pharmacyId),
                }
                : null,
            documents: contract.documents.map((doc) => ({
                ...doc,
                id: Number(doc.id),
                contractId: doc.contractId ? Number(doc.contractId) : null,
                pharmacyId: doc.pharmacyId ? Number(doc.pharmacyId) : null,
                pharmacistId: doc.pharmacistId ? Number(doc.pharmacistId) : null,
            })),
        };
    }
}

