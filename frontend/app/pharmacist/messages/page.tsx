'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacistLayout } from '@/components/pharmacist/Layout';
import { MessageSquare, Calendar, FileText, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { messagesAPI } from '@/lib/api/messages';
import { contractsAPI, Contract } from '@/lib/api/contracts';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';

export default function MessagesPage() {
  const user = useAuthStore((state) => state.user);
  const pharmacistId = user?.relatedId || 1;

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showDateSelection, setShowDateSelection] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  // 会話リストを取得
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await messagesAPI.getConversations(pharmacistId);
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
  }, [pharmacistId]);

  // メッセージを取得
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await messagesAPI.getMessages(selectedConversation);
        if (response.success && response.data) {
          setMessages(response.data);
          // 日付提案メッセージがあるかチェック
          const hasDateProposal = response.data.some(
            (m: any) => m.messageType === 'date_proposal'
          );
          setShowDateSelection(hasDateProposal);
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

  // 初回出勤日を選択
  const handleSelectDate = async () => {
    if (!selectedDate || !selectedConversation) {
      alert('出勤日を選択してください');
      return;
    }

    if (!confirm(`初回出勤日として ${selectedDate} を選択しますか？`)) return;

    setSending(true);
    try {
      const response = await messagesAPI.selectDate(
        selectedConversation,
        pharmacistId,
        selectedDate
      );
      if (response.success) {
        alert('初回出勤日を選択しました');
        // メッセージを再取得
        const messagesResponse = await messagesAPI.getMessages(selectedConversation);
        if (messagesResponse.success && messagesResponse.data) {
          setMessages(messagesResponse.data);
        }
        setSelectedDate('');
        setShowDateSelection(false);
      }
    } catch (error: any) {
      console.error('Failed to select date:', error);
      alert(error.response?.data?.error || '出勤日の選択に失敗しました');
    } finally {
      setSending(false);
    }
  };

  // 正式オファーを承認
  const handleApproveOffer = async () => {
    if (!contract) return;

    if (!confirm('この内容で正式オファーを承認しますか？')) return;

    setApproving(true);
    try {
      const response = await contractsAPI.approve(contract.id, pharmacistId);
      if (response.success) {
        alert('正式オファーを承認しました');
        // 契約情報を再取得
        const contractResponse = await contractsAPI.getByApplicationId(selectedConversation!);
        if (contractResponse.success && contractResponse.data) {
          setContract(contractResponse.data);
        }
        setShowOfferModal(false);
      }
    } catch (error: any) {
      console.error('Failed to approve offer:', error);
      alert(error.response?.data?.error || 'オファーの承認に失敗しました');
    } finally {
      setApproving(false);
    }
  };

  // 正式オファーを辞退
  const handleRejectOffer = async () => {
    if (!contract) return;

    if (!confirm('この正式オファーを辞退しますか？')) return;

    setRejecting(true);
    try {
      const response = await contractsAPI.reject(contract.id, pharmacistId);
      if (response.success) {
        alert('正式オファーを辞退しました');
        // 契約情報を再取得
        const contractResponse = await contractsAPI.getByApplicationId(selectedConversation!);
        if (contractResponse.success && contractResponse.data) {
          setContract(contractResponse.data);
        }
        setShowOfferModal(false);
      }
    } catch (error: any) {
      console.error('Failed to reject offer:', error);
      alert(error.response?.data?.error || 'オファーの辞退に失敗しました');
    } finally {
      setRejecting(false);
    }
  };

  // メッセージタイプに応じた表示
  const renderMessage = (message: any) => {
    const isPharmacist = message.senderType === 'pharmacist';

    if (message.messageType === 'date_proposal') {
      const proposedDates = message.structuredData?.proposedDates || [];
      return (
        <div className={`max-w-md ${isPharmacist ? 'ml-auto' : ''}`}>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">初回出勤日の候補提案</h4>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              以下の日程から初回出勤日を選択してください
            </p>
            <div className="space-y-2">
              {proposedDates.map((date: string, index: number) => (
                <div
                  key={index}
                  className="bg-white p-2 rounded border border-blue-200"
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
      return (
        <div className={`max-w-md ${isPharmacist ? 'ml-auto' : ''}`}>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-900">初回出勤日選択完了</h4>
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
      return (
        <div className={`max-w-md ${isPharmacist ? 'ml-auto' : ''}`}>
          <div
            className={`px-4 py-3 rounded-lg ${message.senderType === 'pharmacist'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-900'
              }`}
          >
            <p>{message.messageContent}</p>
          </div>
          <p
            className={`text-xs mt-1 ${message.senderType === 'pharmacist' ? 'text-gray-500' : 'text-gray-500'
              }`}
          >
            {format(new Date(message.createdAt), 'MM/dd HH:mm', { locale: ja })}
          </p>
        </div>
      );
    }
  };

  const selectedConv = conversations.find(
    (c) => c.applicationId === selectedConversation
  );

  // 日付提案メッセージから候補日を取得
  const dateProposalMessage = messages.find((m) => m.messageType === 'date_proposal');
  const proposedDates = dateProposalMessage?.structuredData?.proposedDates || [];
  const hasSelectedDate = messages.some((m) => m.messageType === 'date_selection');

  // 契約成立後のメッセージ送信制限
  const isContractActive = contract && ['pending_payment', 'active', 'completed'].includes(contract.status);
  const canSendMessage = !isContractActive;

  // 正式オファー通知（H1横に表示）
  const offerNotification = contract && contract.status === 'pending_approval' ? (
    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 animate-pulse">
      <FileText className="w-5 h-5 text-orange-600" />
      <span className="text-sm font-semibold text-orange-900">
        薬局からオファーが来ています
      </span>
    </div>
  ) : null;

  return (
    <ProtectedRoute requiredUserType="pharmacist">
      <PharmacistLayout title="メッセージ管理" offerNotification={offerNotification}>
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          {/* 会話リスト */}
          <div className="col-span-1 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">薬局とのやり取り</h3>
            </div>
            <div className="overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">メッセージはまだありません</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.applicationId}
                    onClick={() => setSelectedConversation(conversation.applicationId)}
                    className={`w-full p-4 border-b border-gray-200 text-left hover:bg-gray-50 transition-colors ${selectedConversation === conversation.applicationId
                      ? 'bg-green-50'
                      : ''
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <MessageSquare size={20} className="text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {conversation.pharmacy?.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate mb-1">
                          {conversation.jobPosting?.title}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage?.content || '新しい会話'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {conversation.lastMessage?.timestamp
                            ? format(
                              new Date(conversation.lastMessage.timestamp),
                              'MM/dd HH:mm',
                              { locale: ja }
                            )
                            : ''}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* メッセージエリア */}
          <div className="col-span-2 bg-white rounded-lg shadow flex flex-col">
            {/* ヘッダー */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {selectedConv
                    ? `${selectedConv.pharmacy?.name} - ${selectedConv.jobPosting?.title}`
                    : 'メッセージを選択してください'}
                </h3>
                {contract && contract.status === 'pending_approval' && (
                  <button
                    onClick={() => setShowOfferModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium animate-pulse"
                  >
                    <FileText size={16} />
                    正式オファーを確認
                  </button>
                )}
                {contract && contract.status === 'pending_payment' && (
                  <Link
                    href={`/pharmacist/contracts/${contract.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <FileText size={16} />
                    契約を確認
                  </Link>
                )}
                {isContractActive && (
                  <Link
                    href="/pharmacist/applications"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <ExternalLink size={16} />
                    勤務中の薬局を見る
                  </Link>
                )}
              </div>
              {isContractActive && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800 font-semibold">
                      {contract.status === 'pending_payment'
                        ? '手続き中'
                        : contract.status === 'active'
                          ? '契約成立：勤務中'
                          : '契約成立'}
                    </p>
                  </div>
                  {contract.status === 'pending_payment' && (
                    <p className="text-xs text-green-700 mt-2">
                      薬局がプラットフォーム手数料を支払い後、薬局の連絡先が開示されます。
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
                      className={`flex ${message.senderType === 'pharmacist'
                        ? 'justify-end'
                        : 'justify-start'
                        }`}
                    >
                      {renderMessage(message)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 初回出勤日選択UI */}
            {showDateSelection && !hasSelectedDate && proposedDates.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  初回出勤日を選択してください
                </h4>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
                >
                  <option value="">日付を選択...</option>
                  {proposedDates.map((date: string, index: number) => (
                    <option key={index} value={date}>
                      {format(new Date(date), 'yyyy年MM月dd日（E）', { locale: ja })}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSelectDate}
                  disabled={!selectedDate || sending}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {sending ? '送信中...' : 'この日程で決定する'}
                </button>
              </div>
            )}

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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sending || !selectedConversation}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sending ? '送信中...' : '送信'}
                  </button>
                </div>
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

        {/* 正式オファー確認モーダル */}
        {showOfferModal && contract && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                正式オファー
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {selectedConv?.pharmacy?.name}からの正式オファー
              </p>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">契約内容</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">初回出勤日:</span>
                      <span className="font-medium">
                        {format(new Date(contract.initialWorkDate), 'yyyy年MM月dd日（E）', { locale: ja })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">勤務日数:</span>
                      <span className="font-medium">{contract.workDays}日</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">報酬総額:</span>
                      <span className="font-medium">
                        ¥{contract.totalCompensation.toLocaleString()}
                        <span className="text-xs text-gray-500 ml-2">
                          （日給¥{contract.dailyWage.toLocaleString()} × {contract.workDays}日）
                        </span>
                      </span>
                    </div>
                    {contract.workHours && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">勤務時間:</span>
                        <span className="font-medium">{contract.workHours}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">重要事項</h4>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>・薬局がプラットフォーム手数料を支払い後、連絡先が開示されます</li>
                    <li>・報酬は体験期間終了後に薬局から直接お支払いいただきます</li>
                    <li>
                      ・初回出勤日の3日前（
                      {format(new Date(contract.paymentDeadline), 'yyyy年MM月dd日', { locale: ja })}
                      ）までに手数料支払いがない場合、契約は自動キャンセルされます
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowOfferModal(false)}
                  disabled={approving || rejecting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleRejectOffer}
                  disabled={approving || rejecting}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:bg-gray-100"
                >
                  {rejecting ? '辞退中...' : '辞退する'}
                </button>
                <button
                  onClick={handleApproveOffer}
                  disabled={approving || rejecting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
                >
                  {approving ? '承認中...' : '承認する'}
                </button>
              </div>
            </div>
          </div>
        )}
      </PharmacistLayout>
    </ProtectedRoute>
  );
}

