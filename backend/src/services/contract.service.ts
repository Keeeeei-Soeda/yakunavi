import prisma from '../utils/prisma';
import { PDFService } from './pdf.service';
import fs from 'fs';
import path from 'path';

interface CreateContractInput {
    applicationId: bigint;
    initialWorkDate: Date | string;
    workDays: number;
    dailyWage: number;
    workHours?: string;
}

export class ContractService {
    private pdfService: PDFService;

    constructor() {
        this.pdfService = new PDFService();

        // uploadsディレクトリが存在しない場合は作成
        const uploadsDir = path.join(process.cwd(), 'uploads', 'invoices');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
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

        // 請求書は薬剤師承認後（approveContract）に生成されます

        return {
            id: Number(contract.id),
            applicationId: Number(contract.applicationId),
            pharmacyId: Number(contract.pharmacyId),
            pharmacistId: Number(contract.pharmacistId),
            jobPostingId: Number(contract.jobPostingId),
            initialWorkDate: contract.initialWorkDate,
            workDays: contract.workDays,
            dailyWage: contract.dailyWage,
            totalCompensation: contract.totalCompensation,
            platformFee: contract.platformFee,
            workHours: contract.workHours,
            status: contract.status,
            paymentDeadline: contract.paymentDeadline,
            paymentConfirmedAt: contract.paymentConfirmedAt,
            approvedAt: contract.approvedAt,
            completedAt: contract.completedAt,
            createdAt: contract.createdAt,
            updatedAt: contract.updatedAt,
            application: contract.application ? {
                id: Number(contract.application.id),
                jobPostingId: Number(contract.application.jobPostingId),
                pharmacistId: Number(contract.application.pharmacistId),
                status: contract.application.status,
                nearestStation: contract.application.nearestStation,
                coverLetter: contract.application.coverLetter,
                createdAt: contract.application.createdAt,
                updatedAt: contract.application.updatedAt,
                appliedAt: contract.application.appliedAt,
                offeredAt: contract.application.offeredAt,
                reviewedAt: contract.application.reviewedAt,
                respondedAt: contract.application.respondedAt,
                jobPosting: contract.application.jobPosting ? {
                    id: Number(contract.application.jobPosting.id),
                    pharmacyId: Number(contract.application.jobPosting.pharmacyId),
                    title: contract.application.jobPosting.title,
                    workLocation: contract.application.jobPosting.workLocation,
                    dailyWage: contract.application.jobPosting.dailyWage,
                    desiredWorkDays: contract.application.jobPosting.desiredWorkDays,
                    desiredWorkHours: contract.application.jobPosting.desiredWorkHours,
                    description: contract.application.jobPosting.description,
                    requirements: contract.application.jobPosting.requirements,
                    workStartPeriodFrom: contract.application.jobPosting.workStartPeriodFrom,
                    workStartPeriodTo: contract.application.jobPosting.workStartPeriodTo,
                    recruitmentDeadline: contract.application.jobPosting.recruitmentDeadline,
                    totalCompensation: contract.application.jobPosting.totalCompensation,
                    platformFee: contract.application.jobPosting.platformFee,
                    status: contract.application.jobPosting.status,
                    publishedAt: contract.application.jobPosting.publishedAt,
                    createdAt: contract.application.jobPosting.createdAt,
                    updatedAt: contract.application.jobPosting.updatedAt,
                    pharmacy: contract.application.jobPosting.pharmacy ? {
                        id: Number(contract.application.jobPosting.pharmacy.id),
                        userId: Number(contract.application.jobPosting.pharmacy.userId),
                        pharmacyName: contract.application.jobPosting.pharmacy.pharmacyName,
                        representativeLastName: contract.application.jobPosting.pharmacy.representativeLastName,
                        representativeFirstName: contract.application.jobPosting.pharmacy.representativeFirstName,
                        address: contract.application.jobPosting.pharmacy.address,
                        nearestStation: contract.application.jobPosting.pharmacy.nearestStation,
                        phoneNumber: contract.application.jobPosting.pharmacy.phoneNumber,
                        createdAt: contract.application.jobPosting.pharmacy.createdAt,
                        updatedAt: contract.application.jobPosting.pharmacy.updatedAt,
                    } : undefined,
                } : undefined,
                pharmacist: contract.application.pharmacist ? {
                    id: Number(contract.application.pharmacist.id),
                    userId: Number(contract.application.pharmacist.userId),
                    lastName: contract.application.pharmacist.lastName,
                    firstName: contract.application.pharmacist.firstName,
                    age: contract.application.pharmacist.age,
                    nearestStation: contract.application.pharmacist.nearestStation,
                    university: contract.application.pharmacist.university,
                    workExperienceYears: contract.application.pharmacist.workExperienceYears,
                    workExperienceMonths: contract.application.pharmacist.workExperienceMonths,
                    licenseFileUrl: contract.application.pharmacist.licenseFileUrl,
                    verificationStatus: contract.application.pharmacist.verificationStatus,
                    workExperienceTypes: contract.application.pharmacist.workExperienceTypes,
                    specialtyAreas: contract.application.pharmacist.specialtyAreas,
                    createdAt: contract.application.pharmacist.createdAt,
                    updatedAt: contract.application.pharmacist.updatedAt,
                } : undefined,
            } : undefined,
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

        // プラットフォーム手数料請求書PDFを生成（薬剤師承認後に生成）
        try {
            const invoiceNumber = `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(contractId).padStart(3, '0')}`;
            const contractNumber = `CNT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(contractId).padStart(3, '0')}`;

            const pdfStream = this.pdfService.generateInvoice({
                invoiceNumber,
                issueDate: new Date(),
                pharmacyName: contract.pharmacy.pharmacyName,
                pharmacyAddress: contract.pharmacy.address || '住所未登録',
                pharmacyPhone: contract.pharmacy.phoneNumber || '電話番号未登録',
                contractNumber,
                pharmacistName: `${contract.pharmacist.lastName} ${contract.pharmacist.firstName}`,
                workDays: contract.workDays,
                initialWorkDate: new Date(contract.initialWorkDate),
                serviceCharge: contract.totalCompensation,
                platformFee: contract.platformFee,
                totalAmount: contract.platformFee,
                paymentDeadline: new Date(contract.paymentDeadline),
            });

            // PDFをファイルとして保存
            const fileName = `${invoiceNumber}.pdf`;
            const filePath = path.join(process.cwd(), 'uploads', 'invoices', fileName);
            const writeStream = fs.createWriteStream(filePath);
            pdfStream.pipe(writeStream);

            await new Promise<void>((resolve, reject) => {
                writeStream.on('finish', () => resolve());
                writeStream.on('error', reject);
            });

            // Documentレコードを作成
            await prisma.document.create({
                data: {
                    contractId,
                    pharmacyId: contract.pharmacyId,
                    pharmacistId: contract.pharmacistId,
                    documentType: 'invoice',
                    documentTitle: 'プラットフォーム手数料請求書',
                    filePath,
                    fileSize: fs.statSync(filePath).size,
                },
            });
        } catch (pdfError) {
            console.error('PDF generation error:', pdfError);
            // PDFの生成に失敗しても契約承認は成功として扱う
        }

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
     * 採用済み薬剤師のプロフィール一覧を取得（薬局側）
     * 支払い確認済み（confirmed）の契約のみを対象とする
     */
    async getHiredPharmacists(pharmacyId: bigint) {
        const contracts = await prisma.contract.findMany({
            where: {
                pharmacyId,
                status: 'active',
                payment: {
                    paymentStatus: 'confirmed',
                },
            },
            include: {
                pharmacist: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
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
                        nearestStation: true,
                        coverLetter: true,
                    },
                },
                payment: {
                    select: {
                        id: true,
                        confirmedAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return contracts.map((contract) => ({
            contractId: Number(contract.id),
            pharmacist: {
                id: Number(contract.pharmacist.id),
                lastName: contract.pharmacist.lastName,
                firstName: contract.pharmacist.firstName,
                phoneNumber: contract.pharmacist.phoneNumber,
                email: contract.pharmacist.user.email,
                age: contract.pharmacist.age,
                university: contract.pharmacist.university,
                graduationYear: contract.pharmacist.graduationYear,
                licenseYear: contract.pharmacist.licenseYear,
                certifiedPharmacistLicense: contract.pharmacist.certifiedPharmacistLicense,
                otherLicenses: contract.pharmacist.otherLicenses,
                workExperienceYears: contract.pharmacist.workExperienceYears,
                workExperienceMonths: contract.pharmacist.workExperienceMonths,
                workExperienceTypes: contract.pharmacist.workExperienceTypes,
                mainDuties: contract.pharmacist.mainDuties,
                specialtyAreas: contract.pharmacist.specialtyAreas,
                pharmacySystems: contract.pharmacist.pharmacySystems,
                specialNotes: contract.pharmacist.specialNotes,
                selfIntroduction: contract.pharmacist.selfIntroduction,
            },
            jobPosting: {
                id: Number(contract.jobPosting.id),
                title: contract.jobPosting.title,
            },
            application: {
                id: Number(contract.application.id),
                appliedAt: contract.application.appliedAt,
                nearestStation: contract.application.nearestStation,
                workExperienceTypes: null, // ApplicationモデルにはworkExperienceTypesフィールドがない
                coverLetter: contract.application.coverLetter,
            },
            paymentConfirmedAt: contract.payment?.confirmedAt,
            contractCreatedAt: contract.createdAt,
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

