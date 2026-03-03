'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { MessageSquare, CheckCircle, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { messagesAPI } from '@/lib/api/messages';
import { contractsAPI, Contract } from '@/lib/api/contracts';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';

export default function MessagesPage() {
    const user = useAuthStore((state) => state.user);
    const pharmacyId = user?.relatedId || 1;

    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [showDateProposalDialog, setShowDateProposalDialog] = useState(false);
    const [proposedDates, setProposedDates] = useState<string[]>(['', '', '']);
    const [proposing, setProposing] = useState(false);
    const [contract, setContract] = useState<Contract | null>(null);
    const [loadingContract, setLoadingContract] = useState(false);
    const [showOfferDialog, setShowOfferDialog] = useState(false);
    const [offerData, setOfferData] = useState({
        workDays: 30,
        dailyWage: 25000,
        workHours: '9:00-18:00',
    });
    const [sendingOffer, setSendingOffer] = useState(false);
    const [isEditingOffer, setIsEditingOffer] = useState(false);

    // 会話リストを取得
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await messagesAPI.getConversations(pharmacyId);
                if (response.success && response.data) {
                    setConversations(response.data);
                    if (response.data.length > 0 && !selectedConversation) {
                        setSelectedConversation(response.data[0].applicationId);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch conversations:', error);
            }
        };

        fetchConversations();
    }, [pharmacyId]);

    // メッセージを取得
    useEffect(() => {
        if (!selectedConversation) return;

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const response = await messagesAPI.getMessages(selectedConversation);
                if (response.success && response.data) {
                    setMessages(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [selectedConversation]);

    // 契約情報を取得
    useEffect(() => {
        if (!selectedConversation) {
            setContract(null);
            return;
        }

        const fetchContract = async () => {
            setLoadingContract(true);
            try {
                const response = await contractsAPI.getByApplicationId(selectedConversation);
                if (response.success && response.data) {
                    setContract(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch contract:', error);
            } finally {
                setLoadingContract(false);
            }
        };

        fetchContract();
    }, [selectedConversation]);

    // メッセージ送信
    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedConversation) return;

        setSending(true);
        try {
            const response = await messagesAPI.sendMessage(
                selectedConversation,
                messageInput
            );
            if (response.success && response.data) {
                setMessages([...messages, response.data]);
                setMessageInput('');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('メッセージの送信に失敗しました');
        } finally {
            setSending(false);
        }
    };

    // 正式オファーを送信
    const handleSendOffer = async () => {
        if (!selectedConversation) {
            alert('会話が選択されていません');
            return;
        }

        const dateSelectionMessage = messages.find((m) => m.messageType === 'date_selection');
        if (!dateSelectionMessage) {
            alert('初回出勤日が選択されていません');
            return;
        }

        const selectedDate = dateSelectionMessage.structuredData?.selectedDate;
        if (!selectedDate) {
            alert('初回出勤日が見つかりません');
            return;
        }

        const totalCompensation = offerData.dailyWage * offerData.workDays;
        const platformFee = Math.floor(totalCompensation * 0.4);
        const platformFeeTaxInclusive = Math.floor(platformFee * 1.1);

        if (!confirm(`以下の内容で正式オファーを送信しますか？\n\n初回出勤日: ${selectedDate}\n勤務日数: ${offerData.workDays}日\n報酬総額: ¥${totalCompensation.toLocaleString()}\nプラットフォーム手数料（税込）: ¥${platformFeeTaxInclusive.toLocaleString()}`)) {
            return;
        }

        setSendingOffer(true);
        try {
            const response = await contractsAPI.create({
                applicationId: selectedConversation,
                initialWorkDate: selectedDate,
                workDays: offerData.workDays,
                dailyWage: offerData.dailyWage,
                workHours: offerData.workHours,
            });

            if (response.success) {
                alert('正式オファーを送信しました。薬剤師の承認をお待ちください。');
                setShowOfferDialog(false);
                // 契約情報を再取得
                const contractResponse = await contractsAPI.getByApplicationId(selectedConversation);
                if (contractResponse.success && contractResponse.data) {
                    setContract(contractResponse.data);
                }
            }
        } catch (error: any) {
            console.error('Failed to send offer:', error);
            alert(error.response?.data?.error || '正式オファーの送信に失敗しました');
        } finally {
            setSendingOffer(false);
        }
    };

    // 初回出勤日候補を提案
    const handleProposeDates = async () => {
        const validDates = proposedDates.filter(date => date.trim() !== '');

        if (validDates.length === 0) {
            alert('最低1つの候補日を入力してください');
            return;
        }

        if (!confirm(`${validDates.length}件の候補日を提案しますか？`)) return;

        setProposing(true);
        try {
            const response = await messagesAPI.proposeDates(
                selectedConversation!,
                pharmacyId,
                validDates
            );
            if (response.success) {
                alert('初回出勤日の候補を提案しました');
                // メッセージを再取得
                const messagesResponse = await messagesAPI.getMessages(selectedConversation!);
                if (messagesResponse.success && messagesResponse.data) {
                    setMessages(messagesResponse.data);
                }
                setShowDateProposalDialog(false);
                setProposedDates(['', '', '']);
            }
        } catch (error: any) {
            console.error('Failed to propose dates:', error);
            alert(error.response?.data?.error || '候補日の提案に失敗しました');
        } finally {
            setProposing(false);
        }
    };

    // 候補日を追加
    const addDateField = () => {
        setProposedDates([...proposedDates, '']);
    };

    // 候補日を削除
    const removeDateField = (index: number) => {
        const newDates = proposedDates.filter((_, i) => i !== index);
        setProposedDates(newDates);
    };

    // 候補日を更新
    const updateDate = (index: number, value: string) => {
        const newDates = [...proposedDates];
        newDates[index] = value;
        setProposedDates(newDates);
    };

    // メッセージタイプに応じた表示
    const renderMessage = (message: any) => {
        if (message.messageType === 'date_proposal') {
            const dates = message.structuredData?.proposedDates || [];
            const isPharmacy = message.senderType === 'pharmacy';
            return (
                <div className={`max-w-md ${isPharmacy ? 'ml-auto' : ''}`}>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">📅</span>
                            <h4 className="font-semibold text-blue-900">初回出勤日の候補提案</h4>
                        </div>
                        <p className="text-sm text-blue-800 mb-3">
                            以下の日程を提案しました
                        </p>
                        <div className="space-y-2">
                            {dates.map((date: string, index: number) => (
                                <div
                                    key={index}
                                    className="bg-white p-2 rounded border border-blue-200 text-sm"
                                >
                                    📅 {format(new Date(date), 'yyyy年MM月dd日（E）', { locale: ja })}
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(message.createdAt), 'MM/dd HH:mm', { locale: ja })}
                    </p>
                </div>
            );
        } else if (message.messageType === 'date_selection') {
            const selectedDate = message.structuredData?.selectedDate;
            const isPharmacy = message.senderType === 'pharmacy';
            return (
                <div className={`max-w-md ${isPharmacy ? 'ml-auto' : ''}`}>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">✅</span>
                            <h4 className="font-semibold text-green-900">初回出勤日が決定しました</h4>
                        </div>
                        <p className="text-sm text-green-800">
                            初回出勤日: {selectedDate && format(new Date(selectedDate), 'yyyy年MM月dd日（E）', { locale: ja })}
                        </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(message.createdAt), 'MM/dd HH:mm', { locale: ja })}
                    </p>
                </div>
            );
        } else {
            // 通常のテキストメッセージ
            return message.messageContent;
        }
    };

    const selectedConv = conversations.find(
        (c) => c.applicationId === selectedConversation
    );

    // 日付提案メッセージが存在するかチェック
    const dateProposalMessage = messages.find((m) => m.messageType === 'date_proposal');
    const hasProposedDates = !!dateProposalMessage;

    // 日付選択メッセージが存在するかチェック
    const dateSelectionMessage = messages.find((m) => m.messageType === 'date_selection');
    const hasSelectedDate = !!dateSelectionMessage;
    const selectedDate = dateSelectionMessage?.structuredData?.selectedDate;

    // 契約成立後のメッセージ送信制限
    const isContractActive = contract && ['pending_payment', 'active', 'completed'].includes(contract.status);
    const canSendMessage = !isContractActive;

    // 正式オファー送信可能かチェック
    const canSendOffer = hasSelectedDate && !contract;

    return (
        <ProtectedRoute requiredUserType="pharmacy">
            <PharmacyLayout title="メッセージ管理">
                <div className="grid grid-cols-3 gap-6 h-[calc(100vh-180px)]">
                    {/* 会話リスト */}
                    <div className="col-span-1 bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">応募者とのやり取り</h3>
                        </div>
                        <div className="overflow-y-auto">
                            {conversations.map((conversation) => (
                                <button
                                    key={conversation.applicationId}
                                    onClick={() => setSelectedConversation(conversation.applicationId)}
                                    className={`w-full p-4 border-b border-gray-200 text-left hover:bg-gray-50 transition-colors ${selectedConversation === conversation.applicationId ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <MessageSquare size={20} className="text-gray-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 truncate">
                                                {conversation.pharmacist?.name || '応募者'}
                                            </h4>
                                            <p className="text-sm text-gray-500 truncate">
                                                {conversation.lastMessage?.content || '新しい会話'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {conversation.lastMessage?.timestamp
                                                    ? format(new Date(conversation.lastMessage.timestamp), 'MM/dd HH:mm', { locale: ja })
                                                    : ''}
                                            </p>
                                        </div>
                                        {conversation.unreadCount > 0 && (
                                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                                {conversation.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* メッセージエリア */}
                    <div className="col-span-2 bg-white rounded-lg shadow flex flex-col">
                        {/* ヘッダー */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900">
                                    {selectedConv
                                        ? `${selectedConv.pharmacist?.name || '応募者'} - ${selectedConv.jobPosting?.title}`
                                        : 'メッセージを選択してください'}
                                </h3>
                                {isContractActive && (
                                    <Link
                                        href="/pharmacy/contracts"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <ExternalLink size={16} />
                                        契約管理を見る
                                    </Link>
                                )}
                            </div>
                            {isContractActive && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <p className="text-sm text-green-800 font-semibold">
                                            {contract.status === 'pending_payment'
                                                ? '契約成立：手数料支払い待ち'
                                                : contract.status === 'active'
                                                    ? '契約成立：勤務中'
                                                    : '契約成立'}
                                        </p>
                                    </div>
                                    {contract.status === 'pending_payment' && (
                                        <p className="text-xs text-green-700 mt-2">
                                            手数料支払い確認後、薬剤師の連絡先が開示されます。
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* メッセージリスト */}
                        <div className="flex-1 p-4 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">読み込み中...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">メッセージはまだありません</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.senderType === 'pharmacy' ? 'justify-end' : 'justify-start'
                                                }`}
                                        >
                                            {message.messageType === 'date_proposal' || message.messageType === 'date_selection' ? (
                                                renderMessage(message)
                                            ) : (
                                                <div
                                                    className={`max-w-md px-4 py-3 rounded-lg ${message.senderType === 'pharmacy'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                        }`}
                                                >
                                                    <p>{message.messageContent}</p>
                                                    <p
                                                        className={`text-xs mt-1 ${message.senderType === 'pharmacy'
                                                            ? 'text-blue-100'
                                                            : 'text-gray-500'
                                                            }`}
                                                    >
                                                        {format(new Date(message.createdAt), 'MM/dd HH:mm', { locale: ja })}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 入力エリア */}
                        {canSendMessage ? (
                            <div className="p-4 border-t border-gray-200">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !sending) {
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="メッセージを入力..."
                                        disabled={!selectedConversation || sending}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim() || sending || !selectedConversation}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {sending ? '送信中...' : '送信'}
                                    </button>
                                </div>
                                {!hasSelectedDate ? (
                                    <>
                                        {hasProposedDates ? (
                                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-sm text-blue-800 font-medium text-center">
                                                    ⏳ 初回出勤日の候補を提案済みです
                                                </p>
                                                <p className="text-xs text-blue-600 mt-1 text-center">
                                                    薬剤師が候補日から選択するまでお待ちください
                                                </p>
                                                <p className="text-xs text-gray-500 mt-2 text-center">
                                                    ※提案は1回のみ可能です
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setShowDateProposalDialog(true)}
                                                    disabled={!selectedConversation}
                                                    className="mt-4 w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    📅 初回出勤日の候補を提案
                                                </button>
                                                <p className="text-xs text-gray-500 mt-2 text-center">
                                                    薬剤師に複数の候補日を提案できます（提案は1回のみ）
                                                </p>
                                            </>
                                        )}
                                    </>
                                ) : canSendOffer ? (
                                    <>
                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-blue-900">📋 契約条件</h4>
                                                {!isEditingOffer ? (
                                                    <button
                                                        onClick={() => setIsEditingOffer(true)}
                                                        className="text-xs px-3 py-1 border border-blue-400 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                                    >
                                                        編集する
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setIsEditingOffer(false)}
                                                        className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        編集を完了
                                                    </button>
                                                )}
                                            </div>

                                            {isEditingOffer ? (
                                                /* 編集モード */
                                                <div className="space-y-3 text-sm">
                                                    <div>
                                                        <p className="text-blue-800 mb-1">• 初回出勤日（薬剤師が選択・変更不可）</p>
                                                        <p className="font-medium text-blue-900 ml-3">{selectedDate && new Date(selectedDate).toLocaleDateString('ja-JP')}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-blue-800 mb-1 block">• 勤務日数</label>
                                                        <div className="flex items-center gap-2 ml-3">
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                max={90}
                                                                value={offerData.workDays}
                                                                onChange={(e) => setOfferData({ ...offerData, workDays: Number(e.target.value) })}
                                                                className="w-24 px-3 py-1.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                                            />
                                                            <span className="text-blue-800">日</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-blue-800 mb-1 block">• 日給</label>
                                                        <div className="flex items-center gap-2 ml-3">
                                                            <span className="text-blue-800">¥</span>
                                                            <input
                                                                type="number"
                                                                min={20000}
                                                                step={1000}
                                                                value={offerData.dailyWage}
                                                                onChange={(e) => setOfferData({ ...offerData, dailyWage: Number(e.target.value) })}
                                                                className="w-32 px-3 py-1.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-blue-800 mb-1">• 報酬総額（自動計算）</p>
                                                        <p className="font-semibold text-blue-900 ml-3">¥{(offerData.dailyWage * offerData.workDays).toLocaleString()}</p>
                                                        <p className="text-xs text-blue-600 ml-3">※薬局から薬剤師への支払いは体験期間終了後</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-blue-800 mb-1 block">• 勤務時間</label>
                                                        <input
                                                            type="text"
                                                            value={offerData.workHours}
                                                            onChange={(e) => setOfferData({ ...offerData, workHours: e.target.value })}
                                                            placeholder="例: 9:00-18:00"
                                                            className="w-full ml-3 px-3 py-1.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                                            style={{ width: 'calc(100% - 12px)' }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                /* 表示モード */
                                                <div className="space-y-1 text-sm text-blue-800">
                                                    <p>• 初回出勤日: {selectedDate && new Date(selectedDate).toLocaleDateString('ja-JP')}</p>
                                                    <p>• 勤務日数: {offerData.workDays}日</p>
                                                    <p>• 日給: ¥{offerData.dailyWage.toLocaleString()}</p>
                                                    <p>• 報酬総額: ¥{(offerData.dailyWage * offerData.workDays).toLocaleString()}</p>
                                                    <p className="text-xs text-blue-600 ml-4">※薬局から薬剤師への支払いは体験期間終了後</p>
                                                    <p>• 勤務時間: {offerData.workHours}</p>
                                                    <p className="text-xs text-blue-600 ml-4">※具体的な勤務曜日・スケジュールは双方の合意のもと後から決定</p>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setShowOfferDialog(true)}
                                            disabled={!selectedConversation || isEditingOffer}
                                            className="mt-4 w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            📄 正式オファーを送信
                                        </button>
                                        {isEditingOffer && (
                                            <p className="text-xs text-orange-600 mt-2 text-center">
                                                ⚠️ 「編集を完了」してからオファーを送信してください
                                            </p>
                                        )}
                                        {!isEditingOffer && (
                                            <p className="text-xs text-gray-500 mt-2 text-center">
                                                この内容で問題なければ、正式オファーをお送りください
                                            </p>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        ) : (
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                                <p className="text-sm text-gray-600 text-center">
                                    ⚠️ 契約成立により、メッセージの送信はできません
                                </p>
                                <p className="text-xs text-gray-500 text-center mt-1">
                                    過去のメッセージ履歴は閲覧可能です
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 正式オファー送信ダイアログ */}
                {showOfferDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                正式オファーを送信
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                以下の内容で正式オファーを送信します
                            </p>

                            <div className="space-y-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">契約内容</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">初回出勤日（薬剤師が選択）</label>
                                            <p className="font-medium">{selectedDate && format(new Date(selectedDate), 'yyyy年MM月dd日（E）', { locale: ja })}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">勤務日数</label>
                                            <p className="font-medium">{offerData.workDays}日</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">日給</label>
                                            <p className="font-medium">¥{offerData.dailyWage.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">報酬総額（自動計算）</label>
                                            <p className="font-medium text-lg">¥{(offerData.dailyWage * offerData.workDays).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500 mt-1">※体験期間終了後に薬剤師へ直接お支払いください</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">プラットフォーム手数料（40%・税込）</label>
                                            <p className="font-medium text-lg text-orange-600">¥{Math.floor(Math.floor((offerData.dailyWage * offerData.workDays) * 0.4) * 1.1).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500 mt-1">※報酬の40%＋消費税10%</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">勤務時間（目安）</label>
                                            <input
                                                type="text"
                                                value={offerData.workHours}
                                                onChange={(e) => setOfferData({ ...offerData, workHours: e.target.value })}
                                                placeholder="例: 9:00-18:00"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-orange-900 mb-2">⚠️ 重要事項</h4>
                                    <ul className="text-sm text-orange-800 space-y-1">
                                        <li>• 初回出勤日の3日前までにプラットフォーム手数料のお支払いが必要です</li>
                                        <li>• 手数料のお支払い確認後、薬剤師の連絡先をお知らせします</li>
                                        <li>• 期限までに未払いの場合、契約は自動キャンセルされます</li>
                                        <li>• 薬剤師への報酬は体験期間終了後に直接お支払いください</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowOfferDialog(false)}
                                    disabled={sendingOffer}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSendOffer}
                                    disabled={sendingOffer}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
                                >
                                    {sendingOffer ? '送信中...' : 'オファーを送信'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 初回出勤日候補提案ダイアログ */}
                {showDateProposalDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                初回出勤日の候補を提案
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                                薬剤師に提案する候補日を入力してください（最低1つ）
                            </p>
                            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <p className="text-xs text-orange-800">
                                    ⚠️ <strong>提案は1回のみ</strong>可能です。慎重に候補日を選択してください。
                                </p>
                            </div>
                            <div className="space-y-3 mb-4">
                                {proposedDates.map((date, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => updateDate(index, e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {proposedDates.length > 1 && (
                                            <button
                                                onClick={() => removeDateField(index)}
                                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                削除
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={addDateField}
                                className="w-full mb-4 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                + 候補日を追加
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDateProposalDialog(false);
                                        setProposedDates(['', '', '']);
                                    }}
                                    disabled={proposing}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleProposeDates}
                                    disabled={proposing}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                                >
                                    {proposing ? '送信中...' : '提案する'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </PharmacyLayout>
        </ProtectedRoute>
    );
}
