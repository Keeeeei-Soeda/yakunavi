'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  LogIn,
  FileText,
  Users,
  MessageSquare,
  Calendar,
  Briefcase,
  CreditCard,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';

interface Section {
  id: string;
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  content: React.ReactNode;
}

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center py-10 my-4 text-gray-400">
      <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 my-3 text-sm text-blue-800">
      <Info size={16} className="flex-shrink-0 mt-0.5 text-blue-500" />
      <span>{children}</span>
    </div>
  );
}

function Caution({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 my-3 text-sm text-yellow-800">
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-yellow-500" />
      <span>{children}</span>
    </div>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2 my-3">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3 text-sm text-gray-700">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
            {i + 1}
          </span>
          <span className="pt-0.5">{step}</span>
        </li>
      ))}
    </ol>
  );
}

const sections: Section[] = [
  {
    id: 'profile',
    step: 1,
    icon: <LogIn size={20} />,
    title: 'プロフィール設定',
    description: 'まず薬局情報を登録しましょう',
    content: (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">プロフィールの入力</h4>
          <p className="text-sm text-gray-600 mb-2">プロフィールが未設定の場合、求人票の掲載や応募の受付ができません。ログイン後まず設定してください。</p>
          <StepList steps={[
            'サイドバーの「プロフィール管理」をクリックします',
            '薬局名、代表者名、住所、電話番号などを入力します',
            '「保存」ボタンで内容を保存します',
          ]} />
          <img src="/guide/pharmacy/profile.png" alt="プロフィール管理画面" className="w-full rounded-xl border border-gray-200 my-4" />
          <Tip>薬局名・所在地・電話番号は必須です。契約成立後、薬剤師に開示されます。</Tip>
        </div>
      </div>
    ),
  },
  {
    id: 'job-posting',
    step: 2,
    icon: <FileText size={20} />,
    title: '求人票の作成・掲載',
    description: '薬剤師が応募できる求人を作成する',
    content: (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">求人票の新規作成</h4>
          <StepList steps={[
            'サイドバーの「求人票」をクリックします',
            '右上の「新規作成」ボタンを押します',
            '勤務日、勤務地、日給、業務内容などを入力します',
            '「下書き保存」または「公開する」を選択します',
          ]} />
          <p className="text-xs text-gray-500 mt-3 mb-1">③ 基本情報・勤務条件の入力画面</p>
          <img src="/guide/pharmacy/job-create.png" alt="求人票作成画面（基本情報・勤務条件）" className="w-full rounded-xl border border-gray-200 my-2" />
          <p className="text-xs text-gray-500 mt-3 mb-1">④ 応募条件・資格の入力と公開ボタン</p>
          <img src="/guide/pharmacy/job-create-publish.png" alt="求人票作成画面（応募条件・公開）" className="w-full rounded-xl border border-gray-200 my-2" />
          <Caution>「公開する」を選択すると薬剤師側に表示されます。内容を確認してから公開しましょう。</Caution>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">求人票の管理</h4>
          <p className="text-sm text-gray-600 mb-2">作成した求人票は一覧から確認・編集できます。「公開中」「下書き」のステータスで管理されます。</p>
          <img src="/guide/pharmacy/job-list.png" alt="求人票一覧画面" className="w-full rounded-xl border border-gray-200 my-4" />
          <Tip>掲載日から1週間後以降の日付を初回出勤日の候補として設定できます。</Tip>
        </div>
      </div>
    ),
  },
  {
    id: 'applications',
    step: 3,
    icon: <Users size={20} />,
    title: '応募確認と対応',
    description: '薬剤師からの応募を確認・管理する',
    content: (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">応募一覧の確認</h4>
          <StepList steps={[
            'サイドバーの「応募確認」をクリックします',
            '応募が届いている一覧が表示されます',
            '詳細をクリックすると薬剤師のプロフィールが確認できます（名前、連絡先などの個人情報は表示されません。契約締結後に表示されます。）',
          ]} />
          <img src="/guide/pharmacy/applications-list.png" alt="応募一覧画面" className="w-full rounded-xl border border-gray-200 my-4" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">応募への対応</h4>
          <p className="text-sm text-gray-600 mb-2">各応募に対して以下の操作ができます。</p>
          <div className="space-y-2 text-sm">
            <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-blue-700 w-20 flex-shrink-0">詳細</span>
              <span className="text-gray-700">薬剤師のプロフィール（経歴・スキルなど）を確認できます。名前・連絡先は契約締結後に表示されます。</span>
            </div>
            <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-blue-700 w-20 flex-shrink-0">メッセージ</span>
              <span className="text-gray-700">薬剤師とメッセージでやり取りを始めます。まずはここからスタートします。</span>
            </div>
            <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-red-700 w-20 flex-shrink-0">却下</span>
              <span className="text-gray-700">応募を却下します。却下後は元に戻せません。</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'messages',
    step: 4,
    icon: <MessageSquare size={20} />,
    title: 'メッセージ・オファー送信',
    description: '薬剤師とのやり取り、初回出勤日候補の送付、正式オファー',
    content: (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">メッセージのやり取り</h4>
          <StepList steps={[
            'サイドバーの「メッセージ管理」をクリックします',
            'やり取りしたい薬剤師を選択します',
            'テキストを入力して「送信」ボタンを押します',
          ]} />
          <img src="/guide/pharmacy/messages.png" alt="メッセージ画面" className="w-full rounded-xl border border-gray-200 my-4" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">初回出勤日候補の送付</h4>
          <StepList steps={[
            'メッセージ画面で「初回出勤日の候補を提案」ボタンを押します',
            '候補日を入力します（掲載日から1週間後以降の日付のみ選択可）',
            '候補日を選択後「提案する」ボタンを押します',
            '「候補日を提案しますか？」の確認メッセージが表示されるので「OK」を押すと薬剤師に候補日が届きます',
          ]} />
          <p className="text-xs text-gray-500 mt-2 mb-1">① 初回出勤日の候補を提案ボタン</p>
          <img src="/guide/pharmacy/messages-chat.png" alt="メッセージ画面（初回出勤日候補ボタン）" className="w-full rounded-xl border border-gray-200 my-4" />
          <p className="text-xs text-gray-500 mt-2 mb-1">② 候補日入力画面</p>
          <img src="/guide/pharmacy/date-proposal.png" alt="初回出勤日候補入力画面" className="w-full rounded-xl border border-gray-200 my-4" />
          <p className="text-xs text-gray-500 mt-2 mb-1">③ 提案するボタン</p>
          <img src="/guide/pharmacy/date-proposal-send.png" alt="提案するボタン" className="w-full rounded-xl border border-gray-200 my-4" />
          <p className="text-xs text-gray-500 mt-2 mb-1">④ 確認メッセージ（OKで薬剤師に届く）</p>
          <img src="/guide/pharmacy/date-proposal-confirm.png" alt="候補日提案の確認" className="w-full rounded-xl border border-gray-200 my-4" />
          <Caution>候補日は掲載日から1週間後以降の日付のみ設定できます。提案は1回のみ可能です。</Caution>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">正式オファーの送信</h4>
          <p className="text-sm text-gray-600 mb-3">
            初回勤務日が決まった後、薬局側から正式オファーを行います。メッセージでのやり取りで条件が合えば、この手順でオファーを送信してください。
          </p>
          <StepList steps={[
            'メッセージ画面下部に「正式オファーを送る」ボタンが表示されます',
            '契約条件（勤務日数・日給）を確認します。変更がある場合は「編集する」ボタンから修正できます',
            '「正式オファーを送信」ボタンを押すと確認モーダルが表示されます',
            '内容を確認して「オファーを送信」を押すと薬剤師に通知が届きます',
          ]} />
          <p className="text-xs text-gray-500 mt-3 mb-1">① 「正式オファーを送る」ボタンが表示された画面</p>
          <img src="/guide/pharmacy/offer-ready.png" alt="正式オファーボタン表示画面" className="w-full rounded-xl border border-gray-200 my-2" />
          <p className="text-xs text-gray-500 mt-3 mb-1">② 契約条件の編集画面（日数・日給を変更できます）</p>
          <img src="/guide/pharmacy/offer-edit.png" alt="契約条件編集画面" className="w-full rounded-xl border border-gray-200 my-2" />
          <p className="text-xs text-gray-500 mt-3 mb-1">③ 送信内容の確認モーダル</p>
          <img src="/guide/pharmacy/offer-modal.png" alt="オファー送信確認モーダル" className="w-full rounded-xl border border-gray-200 my-2" />
          <p className="text-xs text-gray-500 mt-3 mb-1">④ 最終確認ダイアログ（OKで薬剤師に送信）</p>
          <img src="/guide/pharmacy/offer-confirm.png" alt="オファー送信最終確認" className="w-full rounded-xl border border-gray-200 my-2" />
          <Tip>正式オファーが承諾されると、契約管理に契約が作成されます。その後、手数料の支払い手続きに進みます。</Tip>
        </div>
      </div>
    ),
  },
  {
    id: 'contracts',
    step: 5,
    icon: <Briefcase size={20} />,
    title: '契約管理',
    description: '契約中の薬剤師一覧と契約内容を確認',
    content: (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">契約一覧の確認</h4>
          <StepList steps={[
            'サイドバーの「契約管理」をクリックします',
            '契約中の一覧が表示されます',
            '「詳細を見る」ボタンから各契約の詳細を確認できます',
          ]} />
          <img src="/guide/pharmacy/contract-list.png" alt="契約管理一覧画面" className="w-full rounded-xl border border-gray-200 my-4" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">契約のステータス</h4>
          <div className="space-y-2 text-sm">
            <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 bg-yellow-100 text-yellow-800">手続き中</span>
              <span className="text-gray-700">正式オファーを送り、薬剤師の承諾待ちの状態</span>
            </div>
            <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 bg-orange-100 text-orange-800">手数料支払い待ち</span>
              <div className="text-gray-700 space-y-1">
                <p>薬剤師と契約が成立し、薬局からの手数料支払い待ちの状態です。</p>
                <p>期限内に手数料をお振り込みください。</p>
                <p className="text-gray-500">（振込先口座は請求書に記載されています）</p>
              </div>
            </div>
            <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 bg-green-100 text-green-800">契約中</span>
              <span className="text-gray-700">手数料の支払いが完了し、契約が有効な状態</span>
            </div>
            <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 bg-gray-100 text-gray-800">完了</span>
              <span className="text-gray-700">勤務が完了した状態</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">契約詳細の見方</h4>
          <p className="text-sm text-gray-600 mb-3">「詳細を見る」を押すと、契約の状態によって表示内容が変わります。</p>
          <p className="text-xs text-gray-500 mt-2 mb-1">手数料支払い待ちの詳細画面（支払い期限と振込先が表示されます）</p>
          <img src="/guide/pharmacy/contract-detail-pending.png" alt="契約詳細（手数料支払い待ち）" className="w-full rounded-xl border border-gray-200 my-2" />
          <Caution>支払い期限を過ぎると契約が自動キャンセルされます。期限内に必ずお振り込みください。</Caution>
          <p className="text-xs text-gray-500 mt-3 mb-1">契約成立後の詳細画面（薬剤師の連絡先が表示されます）</p>
          <img src="/guide/pharmacy/contract-detail-active.png" alt="契約詳細（契約成立）" className="w-full rounded-xl border border-gray-200 my-2" />
          <Tip>契約成立後、薬剤師の氏名・電話番号・メールアドレスが開示されます。直接連絡を取り、勤務スケジュールを調整してください。</Tip>
        </div>
      </div>
    ),
  },
  {
    id: 'payments',
    step: 6,
    icon: <CreditCard size={20} />,
    title: '請求書・支払い',
    description: '手数料の確認・支払い方法',
    content: (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">手数料について</h4>
          <p className="text-sm text-gray-600">薬剤師の報酬に対して以下の手数料がかかります。</p>
          <div className="mt-3 p-4 bg-blue-50 rounded-xl text-sm">
            <p className="font-semibold text-blue-800 mb-1">プラットフォーム手数料</p>
            <p className="text-blue-700">薬剤師の報酬 × 40% × 1.1（消費税10%込み）</p>
            <p className="text-blue-600 text-xs mt-1">適格請求書発行事業者登録番号：T8120001241474</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">支払いの流れ</h4>
          <p className="text-sm text-gray-600 mb-3">手数料のお支払い後、<strong>支払い報告</strong>をするとステータスが変わります。続いて<strong>運営による入金確認</strong>が完了すると、契約成立となり薬剤師の連絡先が開示されます。</p>
          <StepList steps={[
            'サイドバーの「請求書管理」をクリックします',
            '支払い待ちの請求書の「詳細を見る」を開きます',
            '請求内容と振込先を確認し、指定口座へ振込を行います',
            '振込後に「支払いを報告する」ボタンから報告します（支払い日・振込名義を入力）',
            '報告するとステータスが「支払い報告済み」に変わります',
            '運営が入金を確認（1〜2営業日）すると「支払い確認済み」となり、契約が成立します',
          ]} />
          <p className="text-xs text-gray-500 mt-3 mb-1">① 請求書管理一覧（支払い待ちが1件ある状態）</p>
          <img src="/guide/pharmacy/invoice-list.png" alt="請求書管理一覧" className="w-full rounded-xl border border-gray-200 my-2" />
          <p className="text-xs text-gray-500 mt-3 mb-1">② 請求書詳細（支払い待ち）— 請求内容の確認</p>
          <img src="/guide/pharmacy/invoice-detail-pending.png" alt="請求書詳細（支払い待ち）" className="w-full rounded-xl border border-gray-200 my-2" />
          <p className="text-xs text-gray-500 mt-3 mb-1">③ 同ページ下部：振込先口座の確認と支払い報告フォーム（振込後に支払い日・振込名義を入力して報告）</p>
          <img src="/guide/pharmacy/invoice-payment-report.png" alt="振込先口座と支払い報告フォーム" className="w-full rounded-xl border border-gray-200 my-2" />
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm">
            <p className="font-semibold text-blue-800 mb-2">ステータスの変化</p>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>支払い報告</strong>を送信すると → 「支払い報告済み」に変わります（支払い待ちの件数が0になります）</li>
              <li>• <strong>運営による入金確認</strong>が完了すると → 「支払い確認済み」となり、契約成立・薬剤師連絡先が開示されます</li>
            </ul>
          </div>
          <p className="font-semibold text-gray-800 mt-6 mb-2">ステータス変化の流れ（一覧での表示）</p>
          <p className="text-sm text-gray-600 mb-3">支払い待ち → 支払い報告済み → 支払い確認済みの順に変わります。</p>
          <p className="text-xs text-gray-500 mt-2 mb-1">④ 支払い報告済み（報告直後。INV-000013が水色の「支払い報告済み」、運営確認中）</p>
          <img src="/guide/pharmacy/invoice-list-reported.png" alt="請求書一覧（支払い報告済み）" className="w-full rounded-xl border border-gray-200 my-2" />
          <p className="text-xs text-gray-500 mt-3 mb-1">⑤ 支払い確認済み（運営確認完了後。「支払い確認済み」になった状態）</p>
          <img src="/guide/pharmacy/invoice-list-confirmed.png" alt="請求書一覧（支払い確認済み）" className="w-full rounded-xl border border-gray-200 my-2" />
          <div className="p-4 bg-gray-50 rounded-xl text-sm mt-4">
            <p className="font-semibold text-gray-800 mb-2">振込先口座</p>
            <table className="w-full text-gray-700 text-sm">
              <tbody>
                <tr><td className="py-1 text-gray-500 w-28">銀行名</td><td>GMOあおぞらネット銀行</td></tr>
                <tr><td className="py-1 text-gray-500">支店名</td><td>法人営業部（101）</td></tr>
                <tr><td className="py-1 text-gray-500">口座番号</td><td>2523006</td></tr>
                <tr><td className="py-1 text-gray-500">口座名義</td><td>カ）トレスクーレ</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm">
            <p className="font-semibold text-gray-800 mb-3">請求書を印刷・PDF保存するには？</p>
            <StepList steps={[
              '請求書詳細画面を開きます',
              '右上の「印刷 / PDF保存」ボタンを押します',
              'ブラウザの印刷ダイアログが表示されます',
            ]} />
            <p className="text-xs text-gray-500 mt-2 mb-1">印刷ダイアログ（PDF保存時：保存先を指定して「保存」を押す）</p>
            <img src="/guide/pharmacy/invoice-print-pdf-dialog.png" alt="印刷・PDF保存ダイアログ" className="w-full rounded-xl border border-gray-200 my-2" />
            <div className="mt-3 space-y-2 text-gray-700">
              <div className="flex gap-3 p-2 bg-white rounded-lg border border-gray-200">
                <span className="font-semibold text-gray-800 w-20 flex-shrink-0">印刷する</span>
                <span>プリンターを選択して「プリント」を押します</span>
              </div>
              <div className="flex gap-3 p-2 bg-white rounded-lg border border-gray-200">
                <span className="font-semibold text-gray-800 w-20 flex-shrink-0">PDF保存</span>
                <span>ダイアログ左下の「PDF」→「PDFに保存」を選択し、保存先を指定して「保存」を押してダウンロードします</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">※ 請求書詳細画面の右上「印刷 / PDF保存」ボタンが起点です（上記②の画面右上）</p>
          </div>
          <Caution>振込手数料は貴社負担です。支払い報告後、運営の確認（1〜2営業日）が完了すると契約が有効になり、薬剤師の連絡先が開示されます。</Caution>
        </div>
      </div>
    ),
  },
  {
    id: 'settings',
    step: 7,
    icon: <Calendar size={20} />,
    title: 'その他・よくある質問',
    description: '設定変更・問い合わせ先など',
    content: (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">よくある質問</h4>
          <div className="space-y-3">
            {[
              { q: '応募を却下した後、元に戻せますか？', a: '一度却下した応募は元に戻せません。慎重にご判断ください。' },
              { q: '求人票を削除したい場合は？', a: '公開中の求人票は非公開に変更できます。完全削除はサポートへご連絡ください。' },
              { q: '振込が完了したのに契約が切り替わらない', a: '運営による確認作業があります。確認完了まで1〜2営業日かかる場合があります。お急ぎの場合は info@yaku-navi.com までご連絡ください。' },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-800 text-sm mb-1">Q. {item.q}</p>
                <p className="text-gray-600 text-sm">A. {item.a}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">お問い合わせ</h4>
          <div className="p-4 bg-green-50 rounded-xl text-sm text-green-800">
            <p>ご不明な点は運営までご連絡ください。</p>
            <p className="font-semibold mt-1">📧 info@yaku-navi.com</p>
          </div>
        </div>
      </div>
    ),
  },
];

export default function PharmacyGuidePage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ profile: true });

  const toggle = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ProtectedRoute requiredUserType="pharmacy">
      <PharmacyLayout title="使い方ガイド">
        <div className="max-w-3xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <BookOpen size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">薬局向け 使い方ガイド</h1>
        </div>
        <p className="text-gray-500 text-sm ml-13">求人掲載から契約完了まで、薬ナビの使い方をステップで解説します。</p>
      </div>

      {/* フロー概要 */}
      <div className="bg-blue-50 rounded-2xl p-5 mb-8">
        <h2 className="font-bold text-blue-800 mb-4 text-sm">ご利用の流れ</h2>
        <div className="flex flex-wrap gap-2 items-center">
          {['プロフィール設定', '求人票作成・公開', '応募確認', 'メッセージ・オファー', '手数料支払い', '契約成立'].map((item, i, arr) => (
            <React.Fragment key={item}>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-blue-800 text-sm font-medium whitespace-nowrap">{item}</span>
              </div>
              {i < arr.length - 1 && (
                <span className="text-blue-400 text-sm">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-blue-700">
          <CheckCircle size={14} />
          <span>契約成立後、薬剤師の連絡先が開示されます</span>
        </div>
      </div>

      {/* 各ステップ */}
      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = openSections[section.id];
          return (
            <div key={section.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggle(section.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-500">STEP {section.step}</span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm leading-tight">{section.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                </div>
                <div className="text-gray-400 flex-shrink-0">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-6 pt-1 border-t border-gray-100">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* フッター */}
      <div className="mt-10 text-center text-xs text-gray-400">
        <p>ご不明な点は <a href="mailto:info@yaku-navi.com" className="text-blue-500 hover:underline">info@yaku-navi.com</a> までお問い合わせください</p>
      </div>
        </div>
      </PharmacyLayout>
    </ProtectedRoute>
  );
}
