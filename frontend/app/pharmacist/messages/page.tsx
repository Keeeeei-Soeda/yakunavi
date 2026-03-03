'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacistLayout } from '@/components/pharmacist/Layout';
import { MessageSquare, Calendar, FileText, CheckCircle, ArrowLeft, Send, ExternalLink } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // レスポンシブ判定（幅が変化した時のみ更新。キーボード開閉による高さ変化では発火させない）
  useEffect(() => {
    let prevWidth = window.innerWidth;
    setIsMobile(prevWidth < 900);
    const checkMobile = () => {
      const currentWidth = window.innerWidth;
      if (currentWidth !== prevWidth) {
        prevWidth = currentWidth;
        setIsMobile(currentWidth < 900);
      }
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // メッセージ末尾へスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 会話リストを取得
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await messagesAPI.getConversations(pharmacistId);
        if (response.success && response.data) {
          setConversations(response.data);
          // PCの場合のみ最初の会話を自動選択
          if (!isMobile && response.data.length > 0 && !selectedConversation) {
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
      const response = await messagesAPI.sendMessage(selectedConversation, messageInput);
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
      const response = await messagesAPI.selectDate(selectedConversation, pharmacistId, selectedDate);
      if (response.success) {
        alert('初回出勤日を選択しました');
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
        <div className="max-w-xs sm:max-w-md">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <h4 className="font-semibold text-blue-900 text-sm sm:text-base">初回出勤日の候補提案</h4>
            </div>
            <p className="text-xs sm:text-sm text-blue-800 mb-3">
              以下の日程から初回出勤日を選択してください
            </p>
            <div className="space-y-2">
              {proposedDates.map((date: string, index: number) => (
                <div key={index} className="bg-white p-2 rounded border border-blue-200 text-xs sm:text-sm">
                  📅 {format(new Date(date), 'yyyy年MM月dd日（E）', { locale: ja })}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {format(new Date(message.createdAt), 'MM/dd HH:mm', { locale: ja })}
          </p>
        </div>
      );
    } else if (message.messageType === 'date_selection') {
      const selDate = message.structuredData?.selectedDate;
      return (
        <div className={`max-w-xs sm:max-w-md ${isPharmacist ? 'ml-auto' : ''}`}>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              <h4 className="font-semibold text-green-900 text-sm sm:text-base">初回出勤日選択完了</h4>
            </div>
            <p className="text-xs sm:text-sm text-green-800">
              初回出勤日: {selDate && format(new Date(selDate), 'yyyy年MM月dd日（E）', { locale: ja })}
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {format(new Date(message.createdAt), 'MM/dd HH:mm', { locale: ja })}
          </p>
        </div>
      );
    } else {
      return (
        <div className={`max-w-[70%] sm:max-w-md ${isPharmacist ? 'ml-auto' : ''}`}>
          <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl text-sm sm:text-base ${
            isPharmacist
              ? 'bg-green-500 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}>
            <p className="break-words">{message.messageContent}</p>
          </div>
          <p className={`text-xs mt-1 text-gray-400 ${isPharmacist ? 'text-right' : ''}`}>
            {format(new Date(message.createdAt), 'MM/dd HH:mm', { locale: ja })}
          </p>
        </div>
      );
    }
  };

  const selectedConv = conversations.find((c) => c.applicationId === selectedConversation);
  const dateProposalMessage = messages.find((m) => m.messageType === 'date_proposal');
  const proposedDates = dateProposalMessage?.structuredData?.proposedDates || [];
  const hasSelectedDate = messages.some((m) => m.messageType === 'date_selection');
  const isContractActive = contract && ['pending_payment', 'active', 'completed'].includes(contract.status);
  const canSendMessage = !isContractActive;

  const pharmacyName = selectedConv?.pharmacy?.name || '';

  // オファー通知バナー（ヘッダー横）
  const offerNotification = contract && contract.status === 'pending_approval' ? (
    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5 animate-pulse">
      <FileText className="w-4 h-4 text-orange-600" />
      <span className="text-xs sm:text-sm font-semibold text-orange-900">オファーあり</span>
    </div>
  ) : null;

  // ============================================
  // 会話一覧パネル
  // ============================================
  const ConversationList = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">薬局とのやり取り</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">メッセージはまだありません</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const hasPendingOffer = conversation.contract?.status === 'pending_approval';
            return (
              <button
                key={conversation.applicationId}
                onClick={() => setSelectedConversation(conversation.applicationId)}
                className={`w-full p-4 border-b border-gray-100 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                  selectedConversation === conversation.applicationId ? 'bg-green-50' : ''
                } ${hasPendingOffer ? 'border-l-4 border-l-orange-400' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${hasPendingOffer ? 'bg-orange-100' : 'bg-green-100'}`}>
                    {hasPendingOffer ? (
                      <FileText size={18} className="text-orange-600" />
                    ) : (
                      <MessageSquare size={18} className="text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                        {conversation.pharmacy?.name || '薬局名未設定'}
                      </h4>
                      {conversation.lastMessage?.timestamp && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {format(new Date(conversation.lastMessage.timestamp), 'MM/dd', { locale: ja })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {conversation.jobPosting?.title}
                    </p>
                    {hasPendingOffer ? (
                      <p className="text-xs font-semibold text-orange-600 mt-1 flex items-center gap-1">
                        <FileText size={11} />
                        正式オファーが届いています
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {conversation.lastMessage?.content || '新しい会話'}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {hasPendingOffer && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        要確認
                      </span>
                    )}
                    {conversation.unreadCount > 0 && (
                      <span className="bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  // ============================================
  // チャットパネル
  // ============================================
  const ChatPanel = () => (
    <div className="flex flex-col h-full bg-white">
      {/* チャットヘッダー */}
      <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* スマホのみ戻るボタン */}
          {isMobile && (
            <button
              onClick={() => setSelectedConversation(null)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="一覧に戻る"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
              {pharmacyName || 'メッセージを選択してください'}
            </h3>
            {selectedConv?.jobPosting?.title && (
              <p className="text-xs text-gray-500 truncate">{selectedConv.jobPosting.title}</p>
            )}
          </div>
          {/* アクションボタン群 */}
          <div className="flex-shrink-0 flex items-center gap-1.5">
            {contract?.status === 'pending_approval' && (
              <button
                onClick={() => setShowOfferModal(true)}
                className="bg-orange-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium animate-pulse flex items-center gap-1"
              >
                <FileText size={13} />
                オファー確認
              </button>
            )}
            {contract?.status === 'pending_payment' && (
              <Link
                href={`/pharmacist/contracts/${contract.id}`}
                className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
              >
                <FileText size={13} />
                契約確認
              </Link>
            )}
            {isContractActive && (
              <Link
                href="/pharmacist/applications"
                className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1"
              >
                <ExternalLink size={13} />
                勤務中
              </Link>
            )}
          </div>
        </div>

        {/* 契約成立バナー */}
        {isContractActive && (
          <div className="mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-xs text-green-800 font-semibold">
              {contract.status === 'pending_payment'
                ? '手続き中'
                : contract.status === 'active'
                  ? '契約成立：勤務中'
                  : '契約成立'}
            </p>
            {contract.status === 'pending_payment' && (
              <p className="text-xs text-green-700 ml-1">
                手数料支払い後、薬局の連絡先が開示されます
              </p>
            )}
          </div>
        )}
      </div>

      {/* メッセージリスト */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">読み込み中...</p>
          </div>
        ) : !selectedConversation ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare className="w-14 h-14 mb-3 text-gray-200" />
            <p className="text-sm">会話を選択してください</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">メッセージはまだありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderType === 'pharmacist' ? 'justify-end' : 'justify-start'}`}
              >
                {renderMessage(message)}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 出勤日選択UI */}
      {showDateSelection && !hasSelectedDate && proposedDates.length > 0 && (
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-blue-50 flex-shrink-0">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            初回出勤日を選択してください
          </h4>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
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
            className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300"
          >
            {sending ? '送信中...' : 'この日程で決定する'}
          </button>
        </div>
      )}

      {/* 入力エリア */}
      <div className="p-2 sm:p-3 border-t border-gray-200 flex-shrink-0">
        {canSendMessage ? (
          <div className="flex gap-2 items-end">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !sending) handleSendMessage();
              }}
              placeholder="メッセージを入力..."
              disabled={!selectedConversation || sending}
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              style={{ fontSize: '16px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || sending || !selectedConversation}
              className="bg-green-600 text-white p-2.5 rounded-full hover:bg-green-700 transition-colors disabled:bg-gray-300 flex-shrink-0"
              aria-label="送信"
            >
              <Send size={18} />
            </button>
          </div>
        ) : (
          <div className="py-2 text-center">
            <p className="text-xs text-gray-500">⚠️ 契約成立によりメッセージ送信はできません</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ProtectedRoute requiredUserType="pharmacist">
      <PharmacistLayout
        title="メッセージ管理"
        offerNotification={!isMobile ? offerNotification : undefined}
      >
        {/* ========== スマホ: 会話一覧（通常フロー） ========== */}
        {isMobile && selectedConversation === null && (
          <div className="rounded-lg shadow overflow-hidden bg-white" style={{ minHeight: 'calc(100dvh - 120px)' }}>
            {ConversationList()}
          </div>
        )}

        {/* ========== スマホ: チャット画面（fixed オーバーレイ。再マウント無し・キーボード維持） ========== */}
        {isMobile && selectedConversation !== null && (
          <div
            className="fixed inset-0 z-40 bg-white flex flex-col"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {ChatPanel()}
          </div>
        )}

        {/* ========== PC: 左右2カラム ========== */}
        {!isMobile && (
          <div className="grid grid-cols-3 gap-6 h-[calc(100vh-180px)]">
            <div className="col-span-1 rounded-lg shadow overflow-hidden">
              {ConversationList()}
            </div>
            <div className="col-span-2 rounded-lg shadow overflow-hidden">
              {ChatPanel()}
            </div>
          </div>
        )}

        {/* ========== 正式オファー確認モーダル ========== */}
        {showOfferModal && contract && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5 sm:p-6 w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">正式オファー</h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedConv?.pharmacy?.name}からの正式オファー
              </p>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">契約内容</h4>
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
                        <span className="text-xs text-gray-500 ml-1">
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
                  <h4 className="font-semibold text-orange-900 mb-2 text-sm">重要事項</h4>
                  <ul className="text-xs sm:text-sm text-orange-800 space-y-1">
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

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setShowOfferModal(false)}
                  disabled={approving || rejecting}
                  className="flex-1 px-3 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                >
                  閉じる
                </button>
                <button
                  onClick={handleRejectOffer}
                  disabled={approving || rejecting}
                  className="flex-1 px-3 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm transition-colors"
                >
                  {rejecting ? '辞退中...' : '辞退する'}
                </button>
                <button
                  onClick={handleApproveOffer}
                  disabled={approving || rejecting}
                  className="flex-1 px-3 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
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
