import prisma from '../utils/prisma';

interface SendMessageInput {
    applicationId: bigint;
    senderType: 'pharmacy' | 'pharmacist';
    senderId: bigint;
    messageContent: string;
    messageType?: string;
}

interface ProposeDatesInput {
    applicationId: bigint;
    pharmacyId: bigint;
    proposedDates: string[];
}

export class MessageService {
    /**
     * 会話リストを取得（薬局側）
     */
    async getPharmacyConversations(pharmacyId: bigint) {
        const applications = await prisma.application.findMany({
            where: {
                jobPosting: {
                    pharmacyId,
                },
            },
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
                contract: {
                    include: {
                        payment: {
                            select: {
                                id: true,
                                confirmedAt: true,
                                paymentStatus: true,
                            },
                        },
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        // 匿名化用のインデックスを生成（同じ薬剤師でも異なる応募では異なる匿名名を付与）
        const anonymousNames = ['応募者A', '応募者B', '応募者C', '応募者D', '応募者E', '応募者F', '応募者G', '応募者H', '応募者I', '応募者J'];

        return applications.map((app, index) => {
            // 手数料支払い確認済みかチェック
            const isPaymentConfirmed = app.contract?.payment?.confirmedAt || app.contract?.paymentConfirmedAt;
            
            return {
                applicationId: Number(app.id),
                pharmacist: {
                    id: Number(app.pharmacist.id),
                    lastName: app.pharmacist.lastName,
                    firstName: app.pharmacist.firstName,
                    name: isPaymentConfirmed
                        ? `${app.pharmacist.lastName} ${app.pharmacist.firstName}`
                        : anonymousNames[index % anonymousNames.length],
                    isAnonymous: !isPaymentConfirmed,
                },
                jobPosting: {
                    id: Number(app.jobPosting.id),
                    title: app.jobPosting.title,
                },
                contract: app.contract ? {
                    id: Number(app.contract.id),
                    payment: app.contract.payment ? {
                        id: Number(app.contract.payment.id),
                        confirmedAt: app.contract.payment.confirmedAt,
                        paymentStatus: app.contract.payment.paymentStatus,
                    } : null,
                } : null,
                lastMessage: app.messages[0]
                    ? {
                        content: app.messages[0].messageContent || '',
                        timestamp: app.messages[0].createdAt,
                        isRead: app.messages[0].isRead,
                    }
                    : null,
                unreadCount: app.messages.filter(
                    (m) => m.senderType === 'pharmacist' && !m.isRead
                ).length,
            };
        });
    }

    /**
     * 会話リストを取得（薬剤師側）
     */
    async getPharmacistConversations(pharmacistId: bigint) {
        const applications = await prisma.application.findMany({
            where: {
                pharmacistId,
            },
            include: {
                jobPosting: {
                    select: {
                        id: true,
                        title: true,
                        pharmacy: {
                            select: {
                                id: true,
                                pharmacyName: true,
                            },
                        },
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return applications.map((app) => ({
            applicationId: Number(app.id),
            pharmacy: {
                id: Number(app.jobPosting.pharmacy.id),
                name: app.jobPosting.pharmacy.pharmacyName,
            },
            jobPosting: {
                id: Number(app.jobPosting.id),
                title: app.jobPosting.title,
            },
            lastMessage: app.messages[0]
                ? {
                    content: app.messages[0].messageContent || '',
                    timestamp: app.messages[0].createdAt,
                    isRead: app.messages[0].isRead,
                }
                : null,
            unreadCount: app.messages.filter(
                (m) => m.senderType === 'pharmacy' && !m.isRead
            ).length,
        }));
    }

    /**
     * メッセージ一覧を取得
     */
    async getMessages(applicationId: bigint) {
        const messages = await prisma.message.findMany({
            where: {
                applicationId,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return messages.map((msg) => ({
            id: Number(msg.id),
            senderType: msg.senderType,
            senderId: Number(msg.senderId),
            messageType: msg.messageType,
            messageContent: msg.messageContent,
            structuredData: msg.structuredData,
            isRead: msg.isRead,
            readAt: msg.readAt,
            createdAt: msg.createdAt,
        }));
    }

    /**
     * メッセージを送信
     */
    async sendMessage(input: SendMessageInput) {
        const { applicationId, senderType, senderId, messageContent, messageType } = input;

        // 応募が存在するか確認
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
        });

        if (!application) {
            throw new Error('応募が見つかりません');
        }

        // メッセージを作成
        const message = await prisma.message.create({
            data: {
                applicationId,
                senderType,
                senderId,
                messageType: messageType || 'text',
                messageContent,
                isRead: false,
            },
        });

        // 応募の更新日時を更新
        await prisma.application.update({
            where: { id: applicationId },
            data: { updatedAt: new Date() },
        });

        return {
            id: Number(message.id),
            senderType: message.senderType,
            messageContent: message.messageContent,
            createdAt: message.createdAt,
        };
    }

    /**
     * メッセージを既読にする
     */
    async markAsRead(applicationId: bigint, userType: 'pharmacy' | 'pharmacist') {
        // 相手から送信されたメッセージを既読にする
        const senderType = userType === 'pharmacy' ? 'pharmacist' : 'pharmacy';

        await prisma.message.updateMany({
            where: {
                applicationId,
                senderType,
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    /**
     * 初回出勤日候補を提案
     */
    async proposeDates(input: ProposeDatesInput) {
        const { applicationId, pharmacyId, proposedDates } = input;

        // 応募が存在するか確認
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                jobPosting: true,
            },
        });

        if (!application) {
            throw new Error('応募が見つかりません');
        }

        if (application.jobPosting.pharmacyId !== pharmacyId) {
            throw new Error('この応募にアクセスする権限がありません');
        }

        // 既に日付提案が送信されているかチェック
        const existingDateProposal = await prisma.message.findFirst({
            where: {
                applicationId,
                messageType: 'date_proposal',
            },
        });

        if (existingDateProposal) {
            throw new Error('初回出勤日の候補は既に提案済みです。提案は1回のみ可能です。');
        }

        // 提案メッセージを作成
        const message = await prisma.message.create({
            data: {
                applicationId,
                senderType: 'pharmacy',
                senderId: pharmacyId,
                messageType: 'date_proposal',
                messageContent: '初回出勤日の候補を提案しました',
                structuredData: {
                    type: 'date_proposal',
                    proposedDates,
                },
                isRead: false,
            },
        });

        // 応募の更新日時を更新
        await prisma.application.update({
            where: { id: applicationId },
            data: { updatedAt: new Date() },
        });

        return {
            id: Number(message.id),
            proposedDates,
            createdAt: message.createdAt,
        };
    }

    /**
     * 初回出勤日を選択（薬剤師側）
     */
    async selectDate(applicationId: bigint, pharmacistId: bigint, selectedDate: string) {
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
        });

        if (!application) {
            throw new Error('応募が見つかりません');
        }

        if (application.pharmacistId !== pharmacistId) {
            throw new Error('この応募にアクセスする権限がありません');
        }

        // 選択メッセージを作成
        const message = await prisma.message.create({
            data: {
                applicationId,
                senderType: 'pharmacist',
                senderId: pharmacistId,
                messageType: 'date_selection',
                messageContent: `初回出勤日として ${selectedDate} を選択しました`,
                structuredData: {
                    type: 'date_selection',
                    selectedDate,
                },
                isRead: false,
            },
        });

        return {
            id: Number(message.id),
            selectedDate,
            createdAt: message.createdAt,
        };
    }
}

