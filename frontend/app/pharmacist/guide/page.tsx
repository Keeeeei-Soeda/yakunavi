'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  LogIn,
  User,
  Search,
  Heart,
  Send,
  MessageSquare,
  Calendar,
  Briefcase,
  Bell,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  ShieldCheck,
} from 'lucide-react';

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
    <div className="flex gap-2 bg-green-50 border border-green-200 rounded-lg p-3 my-3 text-sm text-green-800">
      <Info size={16} className="flex-shrink-0 mt-0.5 text-green-500" />
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

function Point({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 my-3 text-sm text-blue-800">
      <Star size={16} className="flex-shrink-0 mt-0.5 text-blue-500" />
      <span>{children}</span>
    </div>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2 my-3">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3 text-sm text-gray-700">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
            {i + 1}
          </span>
          <span className="pt-0.5">{step}</span>
        </li>
      ))}
    </ol>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h4 className="font-semibold text-gray-800 mb-2 mt-5 first:mt-0">{children}</h4>;
}

const sections: Section[] = [
  {
    id: 'register',
    step: 1,
    icon: <LogIn size={20} />,
    title: 'アカウント登録・ログイン',
    description: '薬ナビへの新規登録からログインまで',
    content: (
      <div className="space-y-1">
        <SubHeading>新規アカウント登録</SubHeading>
        <StepList steps={[
          'ブラウザで「https://yaku-navi.com/pharmacist/register」を開きます',
          '法人名（所属法人がある場合）・代表者名、メールアドレス、パスワードを入力します',
          '「登録する」ボタンを押します',
          '登録したメールアドレス宛に確認メールが届きます',
          'メール内のリンクをクリックして、メールアドレスを認証します',
        ]} />
        <ImagePlaceholder label="スクリーンショット：新規登録画面" />
        <Tip>登録に使用したメールアドレスには今後、オファーや通知が届きます。普段使用しているメールアドレスで登録してください。</Tip>

        <SubHeading>ログイン方法</SubHeading>
        <StepList steps={[
          'ブラウザで「https://yaku-navi.com/pharmacist/login」を開きます',
          '登録済みのメールアドレスとパスワードを入力します',
          '「ログイン」ボタンを押すとダッシュボードが表示されます',
        ]} />
        <ImagePlaceholder label="スクリーンショット：ログイン画面" />
        <Caution>パスワードを忘れた場合は、ログイン画面の「パスワードを忘れた方はこちら」から再設定メールを送ることができます。</Caution>
      </div>
    ),
  },
  {
    id: 'profile',
    step: 2,
    icon: <User size={20} />,
    title: 'プロフィール設定・書類提出',
    description: '求人に応募するための必須設定',
    content: (
      <div className="space-y-1">
        <SubHeading>プロフィールの入力</SubHeading>
        <p className="text-sm text-gray-600 mb-2">
          サイドバーの「プロフィール」からプロフィールを設定します。求人への応募前に必ず完成させてください。
        </p>
        <StepList steps={[
          'サイドバーの「プロフィール」をクリックします',
          '氏名・生年月日・電話番号・住所を入力します',
          '最寄駅・勤務形態の希望を入力します',
          '学歴・薬剤師免許取得年・勤務経験を入力します',
          '自己紹介文を入力します（薬局に表示されます）',
          '「保存する」ボタンで内容を保存します',
        ]} />
        <ImagePlaceholder label="スクリーンショット：プロフィール入力画面" />
        <Tip>自己紹介文は薬局が応募を確認する際に表示されます。得意分野や希望条件など、具体的に記入するとマッチングしやすくなります。</Tip>

        <SubHeading>資格書類の提出</SubHeading>
        <p className="text-sm text-gray-600 mb-2">
          求人に応募するには、以下の2種類の書類をアップロードして<strong>管理者の審査・承認</strong>が必要です。
        </p>
        <div className="space-y-2 text-sm my-3">
          {[
            { icon: <ShieldCheck size={16} className="text-green-600" />, label: '薬剤師免許証', desc: '薬剤師免許証の画像（JPG・PNG・PDF）' },
            { icon: <ShieldCheck size={16} className="text-green-600" />, label: '保険薬剤師登録票', desc: '保険薬剤師登録票の画像（JPG・PNG・PDF）' },
          ].map((item) => (
            <div key={item.label} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <p className="font-semibold text-gray-800">{item.label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <StepList steps={[
          'プロフィール画面の「書類提出」セクションを開きます',
          '「薬剤師免許証」のアップロードボタンから画像を選択します',
          '「保険薬剤師登録票」も同様にアップロードします',
          '管理者が審査後、承認メールが届きます',
          '承認が完了すると求人への応募ができるようになります',
        ]} />
        <ImagePlaceholder label="スクリーンショット：書類アップロード画面" />
        <Caution>書類が差し戻された場合は、登録メールアドレスに通知が届きます。プロフィール画面から再提出してください。</Caution>
      </div>
    ),
  },
  {
    id: 'jobs',
    step: 3,
    icon: <Search size={20} />,
    title: '求人の検索・詳細確認',
    description: '自分に合った求人を見つける',
    content: (
      <div className="space-y-1">
        <SubHeading>求人一覧の表示</SubHeading>
        <StepList steps={[
          'サイドバーの「求人検索」をクリックします',
          '掲載中の求人一覧が表示されます',
          '条件（地域・勤務形態など）で絞り込みができます',
        ]} />
        <ImagePlaceholder label="スクリーンショット：求人一覧画面" />

        <SubHeading>求人の詳細確認</SubHeading>
        <StepList steps={[
          '気になる求人をクリックして詳細を開きます',
          '勤務条件・日給・業務内容・薬局情報を確認します',
          '「応募する」または「お気に入り」を選択します',
        ]} />
        <ImagePlaceholder label="スクリーンショット：求人詳細画面" />
        <Tip>「お気に入り」ボタン（ハートアイコン）を押すと、ダッシュボードのお気に入り一覧に保存されます。後でまとめて確認できます。</Tip>

        <SubHeading>お気に入り機能</SubHeading>
        <p className="text-sm text-gray-600">気になる求人はお気に入り登録しておきましょう。ダッシュボードの「お気に入り求人」から一覧で確認できます。</p>
        <ImagePlaceholder label="スクリーンショット：ダッシュボードのお気に入り一覧" />
      </div>
    ),
  },
  {
    id: 'apply',
    step: 4,
    icon: <Send size={20} />,
    title: '求人への応募',
    description: '応募内容を入力して薬局に送る',
    content: (
      <div className="space-y-1">
        <SubHeading>応募の流れ</SubHeading>
        <StepList steps={[
          '求人詳細画面の「応募する」ボタンをクリックします',
          '希望の勤務日程・勤務内容を入力します',
          '「応募する」ボタンを押して薬局に送信します',
        ]} />
        <ImagePlaceholder label="スクリーンショット：応募フォーム画面" />
        <Caution>書類の審査が承認されていない場合、「応募する」ボタンが表示されません。まずプロフィール画面から書類を提出し、審査完了をお待ちください。</Caution>

        <SubHeading>応募後の状態確認</SubHeading>
        <p className="text-sm text-gray-600 mb-2">応募後は「応募管理」画面でステータスを確認できます。</p>
        <div className="space-y-2 text-sm my-2">
          {[
            { status: '応募済み', color: 'bg-blue-100 text-blue-800', desc: '薬局側で応募を確認中です' },
            { status: '承認済み', color: 'bg-green-100 text-green-800', desc: '薬局が応募を確認し、次のステップへ進みます' },
            { status: '却下', color: 'bg-red-100 text-red-800', desc: '今回はご縁がありませんでした。他の求人に応募してみましょう' },
          ].map((item) => (
            <div key={item.status} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${item.color}`}>{item.status}</span>
              <span className="text-gray-700">{item.desc}</span>
            </div>
          ))}
        </div>
        <ImagePlaceholder label="スクリーンショット：応募管理画面（ステータス表示）" />
        <Point>複数の求人に同時応募できます。気になる求人には積極的に応募してみましょう。</Point>
      </div>
    ),
  },
  {
    id: 'messages',
    step: 5,
    icon: <MessageSquare size={20} />,
    title: 'メッセージ・オファー対応',
    description: '薬局からのメッセージと正式オファーへの対応',
    content: (
      <div className="space-y-1">
        <SubHeading>メッセージのやり取り</SubHeading>
        <p className="text-sm text-gray-600 mb-2">
          薬局が応募を確認後、メッセージでやり取りが始まります。条件の確認や質問などをメッセージで行います。
        </p>
        <StepList steps={[
          'サイドバーの「メッセージ」をクリックします',
          'メッセージが届いている薬局を選択します',
          'テキストを入力して「送信」ボタンを押します',
        ]} />
        <ImagePlaceholder label="スクリーンショット：メッセージ画面（会話一覧）" />
        <ImagePlaceholder label="スクリーンショット：メッセージ詳細（チャット画面）" />
        <Tip>新しいメッセージが届くとダッシュボードとメール両方に通知が届きます。</Tip>

        <SubHeading>正式オファーの受け取り</SubHeading>
        <p className="text-sm text-gray-600 mb-2">
          薬局が条件に合うと判断した場合、正式オファーが送られてきます。メッセージ画面に「正式オファーが届きました」と表示されます。
        </p>
        <StepList steps={[
          'メッセージ画面でオファーの内容（勤務日数・日給）を確認します',
          '内容に問題がなければ「オファーを承諾する」ボタンを押します',
          '問題がある場合は「辞退する」ボタンを押します',
        ]} />
        <ImagePlaceholder label="スクリーンショット：正式オファー受け取り画面" />
        <Caution>オファーを承諾すると、薬局側の手数料支払い手続きが始まります。内容をよく確認してから承諾してください。</Caution>

        <SubHeading>初回出勤日候補の選択</SubHeading>
        <p className="text-sm text-gray-600 mb-2">
          薬局から初回出勤日の候補が届いたら、希望する日程を選択します。
        </p>
        <StepList steps={[
          'メッセージ画面に「初回出勤日の候補が届きました」と表示されます',
          '薬局から提示された候補日の中から希望日を選択します',
          '「日程を確定する」ボタンを押して薬局に通知します',
        ]} />
        <ImagePlaceholder label="スクリーンショット：初回出勤日選択画面" />
      </div>
    ),
  },
  {
    id: 'contracts',
    step: 6,
    icon: <Briefcase size={20} />,
    title: '契約管理',
    description: '契約内容と薬局の連絡先の確認',
    content: (
      <div className="space-y-1">
        <SubHeading>契約の確認</SubHeading>
        <StepList steps={[
          'サイドバーの「契約管理」をクリックします',
          '契約中・完了済みの一覧が表示されます',
          '「詳細」ボタンから各契約の詳細を確認できます',
        ]} />
        <ImagePlaceholder label="スクリーンショット：契約管理一覧画面" />

        <SubHeading>薬局の連絡先開示について</SubHeading>
        <p className="text-sm text-gray-600 mb-2">
          薬局が手数料の支払いを完了すると、契約が「契約中」に切り替わり、薬局の連絡先（電話番号・メールアドレス）が開示されます。
        </p>
        <ImagePlaceholder label="スクリーンショット：契約詳細（薬局連絡先）画面" />
        <Tip>連絡先が開示されるまでの間は、メッセージ画面で薬局とやり取りできます。初回出勤日の確認などはメッセージを活用してください。</Tip>

        <SubHeading>契約のステータス一覧</SubHeading>
        <div className="space-y-2 text-sm my-2">
          {[
            { status: '手続き中', color: 'bg-yellow-100 text-yellow-800', desc: '薬局が手数料の支払い手続き中。支払い完了までお待ちください' },
            { status: '契約中', color: 'bg-green-100 text-green-800', desc: '支払いが完了し、契約が有効な状態。薬局の連絡先が開示されます' },
            { status: '完了', color: 'bg-gray-100 text-gray-800', desc: '勤務が完了した状態' },
          ].map((item) => (
            <div key={item.status} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${item.color}`}>{item.status}</span>
              <span className="text-gray-700">{item.desc}</span>
            </div>
          ))}
        </div>
        <ImagePlaceholder label="スクリーンショット：ステータスフィルタ画面" />
      </div>
    ),
  },
  {
    id: 'notifications',
    step: 7,
    icon: <Bell size={20} />,
    title: '通知・お知らせ',
    description: 'ダッシュボードと通知ページの使い方',
    content: (
      <div className="space-y-1">
        <SubHeading>ダッシュボードの確認</SubHeading>
        <p className="text-sm text-gray-600 mb-2">
          ログイン後のダッシュボードでは、現在の応募状況・契約状況・最新の通知をまとめて確認できます。
        </p>
        <div className="space-y-2 text-sm my-2">
          {[
            { label: '応募中', desc: '現在応募中の求人数' },
            { label: '契約中', desc: '現在進行中の契約数' },
            { label: 'お気に入り', desc: 'お気に入り登録している求人数' },
            { label: '最近の通知', desc: '未読の通知一覧（最新5件）' },
          ].map((item) => (
            <div key={item.label} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-green-700 w-24 flex-shrink-0">{item.label}</span>
              <span className="text-gray-700">{item.desc}</span>
            </div>
          ))}
        </div>
        <ImagePlaceholder label="スクリーンショット：ダッシュボード全体" />

        <SubHeading>通知の種類</SubHeading>
        <p className="text-sm text-gray-600 mb-2">次のタイミングでダッシュボードとメールに通知が届きます。</p>
        <div className="space-y-2 text-sm my-2">
          {[
            { type: '正式オファー', color: 'bg-orange-100 text-orange-800', desc: '薬局から正式オファーが届いた時' },
            { type: '契約成立', color: 'bg-green-100 text-green-800', desc: '手数料支払い完了後、契約が有効になった時' },
            { type: '候補日提案', color: 'bg-blue-100 text-blue-800', desc: '薬局から初回出勤日の候補が届いた時' },
            { type: '書類承認', color: 'bg-green-100 text-green-800', desc: '提出した書類が管理者に承認された時' },
            { type: '書類差し戻し', color: 'bg-red-100 text-red-800', desc: '提出した書類が差し戻された時（再提出が必要）' },
          ].map((item) => (
            <div key={item.type} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${item.color}`}>{item.type}</span>
              <span className="text-gray-700">{item.desc}</span>
            </div>
          ))}
        </div>
        <ImagePlaceholder label="スクリーンショット：通知一覧ページ" />

        <SubHeading>通知の全件表示</SubHeading>
        <p className="text-sm text-gray-600">ダッシュボードの「すべての通知を見る」をクリックすると、過去に届いた通知をすべて確認できます。通知をクリックすると既読になり、関連するページに移動します。</p>
        <Tip>重要な通知（オファー・書類差し戻し）はメールでも届きます。メールが届かない場合は迷惑メールフォルダを確認してください。</Tip>
      </div>
    ),
  },
  {
    id: 'faq',
    step: 8,
    icon: <Star size={20} />,
    title: 'よくある質問・お問い合わせ',
    description: '困ったときのガイドと連絡先',
    content: (
      <div className="space-y-1">
        <SubHeading>よくある質問</SubHeading>
        <div className="space-y-3">
          {[
            {
              q: '応募したのに返事が来ない場合は？',
              a: '薬局が確認中の場合があります。「応募管理」で「応募済み」のままの場合は、薬局の確認をお待ちください。しばらく連絡がない場合はメッセージで問い合わせることができます。',
            },
            {
              q: '書類の審査はどのくらいかかりますか？',
              a: '通常1〜3営業日以内に審査結果をお知らせします。承認・差し戻しのどちらの場合も、登録メールアドレスに通知が届きます。',
            },
            {
              q: '一度応募をキャンセルできますか？',
              a: '応募のキャンセルはシステム上できません。やむを得ずキャンセルが必要な場合は、薬局にメッセージで連絡するか、運営（info@yaku-navi.com）までご連絡ください。',
            },
            {
              q: '複数の薬局に同時に応募できますか？',
              a: 'はい、複数の求人に同時に応募できます。ただし、すでに契約が成立している期間と重複する勤務日への応募はご遠慮ください。',
            },
            {
              q: 'お気に入り登録の上限はありますか？',
              a: 'お気に入りの上限はありません。気になる求人をまとめて保存しておけます。',
            },
            {
              q: 'プロフィールはいつでも更新できますか？',
              a: 'はい、いつでも更新できます。ただし書類の再提出が必要な場合は、再度審査が必要になります。',
            },
            {
              q: 'パスワードを忘れた場合は？',
              a: 'ログイン画面の「パスワードを忘れた方はこちら」から、登録メールアドレス宛に再設定リンクを送ることができます。',
            },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl">
              <p className="font-semibold text-gray-800 text-sm mb-1">Q. {item.q}</p>
              <p className="text-gray-600 text-sm">A. {item.a}</p>
            </div>
          ))}
        </div>

        <SubHeading>お問い合わせ</SubHeading>
        <div className="p-4 bg-green-50 rounded-xl text-sm text-green-800">
          <p>ご不明な点は運営までお気軽にご連絡ください。</p>
          <p className="font-semibold mt-1">📧 info@yaku-navi.com</p>
          <p className="text-xs text-green-700 mt-1">平日 10:00〜18:00 対応</p>
        </div>
      </div>
    ),
  },
];

export default function PharmacistGuidePage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ register: true });

  const toggle = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <BookOpen size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">薬剤師向け 使い方ガイド</h1>
        </div>
        <p className="text-gray-500 text-sm">登録からお仕事開始まで、薬ナビの使い方をステップで解説します。</p>
      </div>

      {/* フロー概要 */}
      <div className="bg-green-50 rounded-2xl p-5 mb-8">
        <h2 className="font-bold text-green-800 mb-4 text-sm">ご利用の流れ</h2>
        <div className="flex flex-wrap gap-2 items-center">
          {[
            'アカウント登録',
            'プロフィール設定',
            '書類提出・審査',
            '求人応募',
            'オファー承諾',
            'お仕事開始',
          ].map((item, i, arr) => (
            <React.Fragment key={item}>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-green-800 text-sm font-medium whitespace-nowrap">{item}</span>
              </div>
              {i < arr.length - 1 && (
                <span className="text-green-400 text-sm">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-green-700">
            <CheckCircle size={14} />
            <span>書類審査が完了するまで求人への応募はできません</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-700">
            <CheckCircle size={14} />
            <span>契約成立後、薬局の連絡先が開示されます</span>
          </div>
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
                <div className="w-9 h-9 bg-green-100 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-green-500">STEP {section.step}</span>
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
        <p>ご不明な点は <a href="mailto:info@yaku-navi.com" className="text-green-500 hover:underline">info@yaku-navi.com</a> までお問い合わせください</p>
      </div>
    </div>
  );
}
