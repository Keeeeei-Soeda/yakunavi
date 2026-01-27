import { apiClient } from './client';
import { APIResponse } from '../types';

interface Conversation {
    applicationId: number;
    pharmacy?: {
        id: number;
        name: string;
    };
    pharmacist?: {
        id: number;
        name: string;
    };
    jobPosting: {
        id: number;
        title: string;
    };
    lastMessage: {
        content: string;
        timestamp: string;
        isRead: boolean;
    } | null;
    unreadCount: number;
}

interface Message {
    id: number;
    senderType: 'pharmacy' | 'pharmacist';
    senderId: number;
    messageType: string;
    messageContent: string | null;
    structuredData: any;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
}

export const messagesAPI = {
    // 会話リスト取得
    getConversations: async (relatedId: number) => {
        return apiClient.get<APIResponse<Conversation[]>>(
            `/messages/conversations/${relatedId}`
        );
    },

    // メッセージ一覧取得
    getMessages: async (applicationId: number) => {
        return apiClient.get<APIResponse<Message[]>>(`/messages/${applicationId}`);
    },

    // メッセージ送信
    sendMessage: async (applicationId: number, messageContent: string) => {
        return apiClient.post<APIResponse<Message>>(`/messages/${applicationId}`, {
            messageContent,
        });
    },

    // 初回出勤日候補提案（薬局側）
    proposeDates: async (
        applicationId: number,
        pharmacyId: number,
        proposedDates: string[]
    ) => {
        return apiClient.post<APIResponse>(
            `/messages/${applicationId}/propose-dates`,
            {
                pharmacyId,
                proposedDates,
            }
        );
    },

    // 初回出勤日選択（薬剤師側）
    selectDate: async (
        applicationId: number,
        pharmacistId: number,
        selectedDate: string
    ) => {
        return apiClient.post<APIResponse>(`/messages/${applicationId}/select-date`, {
            pharmacistId,
            selectedDate,
        });
    },
};

