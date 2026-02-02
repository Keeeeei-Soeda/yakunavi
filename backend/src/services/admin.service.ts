import prisma from '../utils/prisma';

interface PaginationParams {
    page?: number;
    limit?: number;
}

interface SearchParams extends PaginationParams {
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}

export class AdminService {
    /**
     * ダッシュボード統計を取得
     */
    async getDashboardStats() {
        const [
            totalPharmacies,
            totalPharmacists,
            activeJobPostings,
            totalContracts,
            pendingCertificates,
            pendingPayments,
        ] = await Promise.all([
            // 総薬局数
            prisma.pharmacy.count(),
            // 総薬剤師数
            prisma.pharmacist.count(),
            // アクティブな求人数
            prisma.jobPosting.count({
                where: { status: 'published' },
            }),
            // 総契約数
            prisma.contract.count({
                where: { status: 'active' },
            }),
            // 未確認証明書数
            prisma.certificate.count({
                where: { verificationStatus: 'pending' },
            }),
            // 未確認支払い数
            prisma.payment.count({
                where: { paymentStatus: 'reported' },
            }),
        ]);

        return {
            totalPharmacies,
            totalPharmacists,
            activeJobPostings,
            totalContracts,
            pendingCertificates,
            pendingPayments,
        };
    }

    /**
     * 資格証明書一覧を取得
     */
    async getCertificates(params: SearchParams) {
        const { page = 1, limit = 20, status, search } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status) {
            where.verificationStatus = status;
        }

        if (search) {
            where.OR = [
                { pharmacist: { lastName: { contains: search } } },
                { pharmacist: { firstName: { contains: search } } },
                { pharmacist: { licenseNumber: { contains: search } } },
            ];
        }

        const [certificates, total] = await Promise.all([
            prisma.certificate.findMany({
                where,
                skip,
                take: limit,
                orderBy: { uploadedAt: 'desc' },
                include: {
                    pharmacist: {
                        include: {
                            user: true,
                        },
                    },
                },
            }),
            prisma.certificate.count({ where }),
        ]);

        return {
            data: certificates.map((cert) => ({
                id: Number(cert.id),
                pharmacistId: Number(cert.pharmacistId),
                certificateType: cert.certificateType,
                fileName: cert.fileName,
                filePath: cert.filePath,
                uploadedAt: cert.uploadedAt,
                verificationStatus: cert.verificationStatus,
                verifiedAt: cert.verifiedAt,
                pharmacist: {
                    id: Number(cert.pharmacist.id),
                    lastName: cert.pharmacist.lastName,
                    firstName: cert.pharmacist.firstName,
                    licenseNumber: cert.pharmacist.licenseNumber,
                    email: cert.pharmacist.user.email,
                },
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * 資格証明書を承認
     */
    async approveCertificate(certificateId: bigint, adminId: bigint, comment?: string) {
        const certificate = await prisma.certificate.findUnique({
            where: { id: certificateId },
            include: { pharmacist: true },
        });

        if (!certificate) {
            throw new Error('証明書が見つかりません');
        }

        if (certificate.verificationStatus !== 'pending') {
            throw new Error('この証明書は既に処理されています');
        }

        // 証明書を承認
        const updatedCertificate = await prisma.certificate.update({
            where: { id: certificateId },
            data: {
                verificationStatus: 'verified',
                verifiedAt: new Date(),
                verifiedBy: adminId,
            },
        });

        // 薬剤師の検証ステータスを更新
        // すべての証明書が承認されているかチェック
        const allCertificates = await prisma.certificate.findMany({
            where: { pharmacistId: certificate.pharmacistId },
        });

        const allVerified = allCertificates.every((cert) => cert.verificationStatus === 'verified');

        if (allVerified) {
            await prisma.pharmacist.update({
                where: { id: certificate.pharmacistId },
                data: {
                    verificationStatus: 'verified',
                    verifiedAt: new Date(),
                },
            });
        }

        return {
            ...updatedCertificate,
            id: Number(updatedCertificate.id),
            pharmacistId: Number(updatedCertificate.pharmacistId),
        };
    }

    /**
     * 資格証明書を差し戻す
     */
    async rejectCertificate(certificateId: bigint, reason: string) {
        const certificate = await prisma.certificate.findUnique({
            where: { id: certificateId },
        });

        if (!certificate) {
            throw new Error('証明書が見つかりません');
        }

        if (certificate.verificationStatus !== 'pending') {
            throw new Error('この証明書は既に処理されています');
        }

        const updatedCertificate = await prisma.certificate.update({
            where: { id: certificateId },
            data: {
                verificationStatus: 'rejected',
                rejectionReason: reason,
            },
        });

        return {
            ...updatedCertificate,
            id: Number(updatedCertificate.id),
            pharmacistId: Number(updatedCertificate.pharmacistId),
        };
    }

    /**
     * 契約一覧を取得（管理者用）
     */
    async getContracts(params: SearchParams) {
        const { page = 1, limit = 20, status, search, startDate, endDate } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { pharmacy: { pharmacyName: { contains: search } } },
                { pharmacist: { lastName: { contains: search } } },
                { pharmacist: { firstName: { contains: search } } },
            ];
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const [contracts, total] = await Promise.all([
            prisma.contract.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    pharmacy: {
                        include: { user: true },
                    },
                    pharmacist: {
                        include: { user: true },
                    },
                    jobPosting: true,
                    payment: true,
                },
            }),
            prisma.contract.count({ where }),
        ]);

        return {
            data: contracts.map((contract) => ({
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
                status: contract.status,
                paymentDeadline: contract.paymentDeadline,
                createdAt: contract.createdAt,
                pharmacy: {
                    id: Number(contract.pharmacy.id),
                    pharmacyName: contract.pharmacy.pharmacyName,
                    email: contract.pharmacy.user.email,
                },
                pharmacist: {
                    id: Number(contract.pharmacist.id),
                    lastName: contract.pharmacist.lastName,
                    firstName: contract.pharmacist.firstName,
                    email: contract.pharmacist.user.email,
                },
                payment: contract.payment
                    ? {
                        id: Number(contract.payment.id),
                        paymentStatus: contract.payment.paymentStatus,
                        reportedAt: contract.payment.reportedAt,
                        confirmedAt: contract.payment.confirmedAt,
                    }
                    : null,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * ペナルティ一覧を取得
     */
    async getPenalties(params: SearchParams) {
        const { page = 1, limit = 20, status, search } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status) {
            where.penaltyStatus = status;
        }

        if (search) {
            where.pharmacy = {
                pharmacyName: { contains: search },
            };
        }

        const [penalties, total] = await Promise.all([
            prisma.penalty.findMany({
                where,
                skip,
                take: limit,
                orderBy: { imposedAt: 'desc' },
                include: {
                    pharmacy: {
                        include: { user: true },
                    },
                },
            }),
            prisma.penalty.count({ where }),
        ]);

        return {
            data: penalties.map((penalty) => ({
                id: Number(penalty.id),
                pharmacyId: Number(penalty.pharmacyId),
                contractId: penalty.contractId ? Number(penalty.contractId) : null,
                penaltyType: penalty.penaltyType,
                reason: penalty.reason,
                penaltyStatus: penalty.penaltyStatus,
                imposedAt: penalty.imposedAt,
                resolvedAt: penalty.resolvedAt,
                pharmacy: {
                    id: Number(penalty.pharmacy.id),
                    pharmacyName: penalty.pharmacy.pharmacyName,
                    email: penalty.pharmacy.user.email,
                },
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * 支払い一覧を取得（管理者用）
     */
    async getPayments(params: SearchParams) {
        const { page = 1, limit = 20, status, search } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status && status !== 'all') {
            where.paymentStatus = status;
        }

        if (search) {
            const searchConditions: any[] = [
                { contract: { pharmacy: { pharmacyName: { contains: search } } } },
                { contract: { pharmacist: { lastName: { contains: search } } } },
                { contract: { pharmacist: { firstName: { contains: search } } } },
            ];

            // 数値の場合はID検索も追加
            if (!isNaN(Number(search))) {
                try {
                    searchConditions.push({ id: BigInt(search) });
                } catch (e) {
                    // BigInt変換に失敗した場合は無視
                }
            }

            where.OR = searchConditions;
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
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
                            pharmacy: {
                                select: {
                                    id: true,
                                    pharmacyName: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.payment.count({ where }),
        ]);

        return {
            data: payments.map((payment) => ({
                id: Number(payment.id),
                contractId: Number(payment.contractId),
                pharmacyId: Number(payment.pharmacyId),
                amount: Number(payment.amount),
                paymentStatus: payment.paymentStatus,
                transferName: payment.transferName,
                reportedAt: payment.reportedAt,
                confirmedAt: payment.confirmedAt,
                createdAt: payment.createdAt,
                pharmacy: {
                    id: Number(payment.contract.pharmacy.id),
                    pharmacyName: payment.contract.pharmacy.pharmacyName,
                },
                contract: {
                    pharmacist: {
                        id: Number(payment.contract.pharmacist.id),
                        lastName: payment.contract.pharmacist.lastName,
                        firstName: payment.contract.pharmacist.firstName,
                    },
                },
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * ペナルティを解除
     */
    async resolvePenalty(penaltyId: bigint, resolutionNote?: string) {
        const penalty = await prisma.penalty.findUnique({
            where: { id: penaltyId },
        });

        if (!penalty) {
            throw new Error('ペナルティが見つかりません');
        }

        if (penalty.penaltyStatus !== 'active') {
            throw new Error('このペナルティは既に処理されています');
        }

        const updatedPenalty = await prisma.penalty.update({
            where: { id: penaltyId },
            data: {
                penaltyStatus: 'resolved',
                resolvedAt: new Date(),
                resolutionNote,
            },
        });

        return {
            ...updatedPenalty,
            id: Number(updatedPenalty.id),
            pharmacyId: Number(updatedPenalty.pharmacyId),
            contractId: updatedPenalty.contractId ? Number(updatedPenalty.contractId) : null,
        };
    }

    /**
     * 統計データを取得
     */
    async getStatistics(startDate?: string, endDate?: string) {
        const dateFilter: any = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        const where = startDate || endDate ? { createdAt: dateFilter } : {};

        const [
            newPharmacies,
            newPharmacists,
            newJobPostings,
            newApplications,
            newContracts,
            totalRevenue,
        ] = await Promise.all([
            prisma.pharmacy.count({ where }),
            prisma.pharmacist.count({ where }),
            prisma.jobPosting.count({ where }),
            prisma.application.count({ where }),
            prisma.contract.count({ where }),
            prisma.payment.aggregate({
                where: { paymentStatus: 'confirmed', ...where },
                _sum: { amount: true },
            }),
        ]);

        return {
            newPharmacies,
            newPharmacists,
            newJobPostings,
            newApplications,
            newContracts,
            totalRevenue: totalRevenue._sum.amount || 0,
        };
    }

    /**
     * 求人一覧を取得（管理者用）
     */
    async getJobPostings(params: SearchParams) {
        const { page = 1, limit = 20, status, search } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { pharmacy: { pharmacyName: { contains: search } } },
                { workLocation: { contains: search } },
            ];
        }

        const [jobPostings, total] = await Promise.all([
            prisma.jobPosting.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    pharmacy: {
                        include: { user: true },
                    },
                    _count: {
                        select: { applications: true },
                    },
                },
            }),
            prisma.jobPosting.count({ where }),
        ]);

        return {
            data: jobPostings.map((job) => ({
                id: Number(job.id),
                pharmacyId: Number(job.pharmacyId),
                title: job.title,
                workLocation: job.workLocation,
                dailyWage: job.dailyWage,
                desiredWorkDays: job.desiredWorkDays,
                status: job.status,
                applicationCount: job._count.applications,
                publishedAt: job.publishedAt,
                createdAt: job.createdAt,
                pharmacy: {
                    id: Number(job.pharmacy.id),
                    pharmacyName: job.pharmacy.pharmacyName,
                    email: job.pharmacy.user.email,
                },
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * 応募一覧を取得（管理者用）
     */
    async getApplications(params: SearchParams) {
        const { page = 1, limit = 20, status, search } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { jobPosting: { pharmacy: { pharmacyName: { contains: search } } } },
                { pharmacist: { lastName: { contains: search } } },
                { pharmacist: { firstName: { contains: search } } },
            ];
        }

        const [applications, total] = await Promise.all([
            prisma.application.findMany({
                where,
                skip,
                take: limit,
                orderBy: { appliedAt: 'desc' },
                include: {
                    jobPosting: {
                        include: {
                            pharmacy: true,
                        },
                    },
                    pharmacist: {
                        include: { user: true },
                    },
                },
            }),
            prisma.application.count({ where }),
        ]);

        return {
            data: applications.map((app) => ({
                id: Number(app.id),
                jobPostingId: Number(app.jobPostingId),
                pharmacistId: Number(app.pharmacistId),
                status: app.status,
                appliedAt: app.appliedAt,
                jobPosting: {
                    id: Number(app.jobPosting.id),
                    title: app.jobPosting.title,
                    pharmacy: {
                        id: Number(app.jobPosting.pharmacy.id),
                        pharmacyName: app.jobPosting.pharmacy.pharmacyName,
                    },
                },
                pharmacist: {
                    id: Number(app.pharmacist.id),
                    lastName: app.pharmacist.lastName,
                    firstName: app.pharmacist.firstName,
                    email: app.pharmacist.user.email,
                },
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * 薬剤師一覧を取得（管理者用）
     */
    async getPharmacists(params: SearchParams) {
        const { page = 1, limit = 20, status, search } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status === 'active') {
            where.user = { isActive: true };
        } else if (status === 'inactive') {
            where.user = { isActive: false };
        }

        if (search) {
            where.OR = [
                { lastName: { contains: search } },
                { firstName: { contains: search } },
                { user: { email: { contains: search } } },
                { licenseNumber: { contains: search } },
            ];
        }

        const [pharmacists, total] = await Promise.all([
            prisma.pharmacist.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: true,
                    _count: {
                        select: {
                            applications: true,
                            contracts: true,
                        },
                    },
                },
            }),
            prisma.pharmacist.count({ where }),
        ]);

        return {
            data: pharmacists.map((pharmacist) => ({
                id: Number(pharmacist.id),
                userId: Number(pharmacist.userId),
                lastName: pharmacist.lastName,
                firstName: pharmacist.firstName,
                email: pharmacist.user.email,
                phoneNumber: pharmacist.phoneNumber,
                licenseNumber: pharmacist.licenseNumber,
                verificationStatus: pharmacist.verificationStatus,
                isActive: pharmacist.user.isActive,
                createdAt: pharmacist.createdAt,
                applicationCount: pharmacist._count.applications,
                contractCount: pharmacist._count.contracts,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * 薬局一覧を取得（管理者用）
     */
    async getPharmacies(params: SearchParams) {
        const { page = 1, limit = 20, status, search } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status === 'active') {
            where.user = { isActive: true };
        } else if (status === 'inactive') {
            where.user = { isActive: false };
        }

        if (search) {
            where.OR = [
                { pharmacyName: { contains: search } },
                { representativeLastName: { contains: search } },
                { representativeFirstName: { contains: search } },
                { user: { email: { contains: search } } },
            ];
        }

        const [pharmacies, total] = await Promise.all([
            prisma.pharmacy.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: true,
                    _count: {
                        select: {
                            jobPostings: true,
                            contracts: true,
                        },
                    },
                },
            }),
            prisma.pharmacy.count({ where }),
        ]);

        return {
            data: pharmacies.map((pharmacy) => ({
                id: Number(pharmacy.id),
                userId: Number(pharmacy.userId),
                pharmacyName: pharmacy.pharmacyName,
                representativeName: `${pharmacy.representativeLastName} ${pharmacy.representativeFirstName}`,
                email: pharmacy.user.email,
                phoneNumber: pharmacy.phoneNumber,
                prefecture: pharmacy.prefecture,
                isActive: pharmacy.user.isActive,
                createdAt: pharmacy.createdAt,
                jobPostingCount: pharmacy._count.jobPostings,
                contractCount: pharmacy._count.contracts,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * 薬局詳細を取得（管理者用）
     */
    async getPharmacyById(pharmacyId: bigint) {
        const pharmacy = await prisma.pharmacy.findUnique({
            where: { id: pharmacyId },
            include: {
                user: true,
                _count: {
                    select: {
                        jobPostings: true,
                        contracts: true,
                    },
                },
            },
        });

        if (!pharmacy) {
            throw new Error('薬局が見つかりません');
        }

        return {
            id: Number(pharmacy.id),
            userId: Number(pharmacy.userId),
            pharmacyName: pharmacy.pharmacyName,
            representativeLastName: pharmacy.representativeLastName,
            representativeFirstName: pharmacy.representativeFirstName,
            email: pharmacy.user.email,
            phoneNumber: pharmacy.phoneNumber,
            faxNumber: pharmacy.faxNumber,
            prefecture: pharmacy.prefecture,
            address: pharmacy.address,
            nearestStation: pharmacy.nearestStation,
            establishedDate: pharmacy.establishedDate,
            dailyPrescriptionCount: pharmacy.dailyPrescriptionCount,
            staffCount: pharmacy.staffCount,
            businessHoursStart: pharmacy.businessHoursStart,
            businessHoursEnd: pharmacy.businessHoursEnd,
            introduction: pharmacy.introduction,
            strengths: pharmacy.strengths,
            equipmentSystems: pharmacy.equipmentSystems,
            isActive: pharmacy.user.isActive,
            createdAt: pharmacy.createdAt,
            jobPostingCount: pharmacy._count.jobPostings,
            contractCount: pharmacy._count.contracts,
        };
    }

    /**
     * 薬剤師詳細を取得（管理者用）
     */
    async getPharmacistById(pharmacistId: bigint) {
        const pharmacist = await prisma.pharmacist.findUnique({
            where: { id: pharmacistId },
            include: {
                user: true,
                _count: {
                    select: {
                        applications: true,
                        contracts: true,
                    },
                },
            },
        });

        if (!pharmacist) {
            throw new Error('薬剤師が見つかりません');
        }

        return {
            id: Number(pharmacist.id),
            userId: Number(pharmacist.userId),
            lastName: pharmacist.lastName,
            firstName: pharmacist.firstName,
            email: pharmacist.user.email,
            phoneNumber: pharmacist.phoneNumber,
            address: pharmacist.address,
            licenseNumber: pharmacist.licenseNumber,
            verificationStatus: pharmacist.verificationStatus,
            age: pharmacist.age,
            university: pharmacist.university,
            graduationYear: pharmacist.graduationYear,
            licenseYear: pharmacist.licenseYear,
            workExperienceYears: pharmacist.workExperienceYears,
            workExperienceMonths: pharmacist.workExperienceMonths,
            workExperienceTypes: pharmacist.workExperienceTypes,
            certifiedPharmacistLicense: pharmacist.certifiedPharmacistLicense,
            otherLicenses: pharmacist.otherLicenses,
            specialtyAreas: pharmacist.specialtyAreas,
            selfIntroduction: pharmacist.selfIntroduction,
            isActive: pharmacist.user.isActive,
            createdAt: pharmacist.createdAt,
            applicationCount: pharmacist._count.applications,
            contractCount: pharmacist._count.contracts,
        };
    }

    /**
     * アカウントを停止/有効化
     */
    async toggleUserStatus(userId: bigint, isActive: boolean) {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive },
        });

        return {
            id: Number(updatedUser.id),
            email: updatedUser.email,
            isActive: updatedUser.isActive,
        };
    }
}

