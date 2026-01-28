/**
 * 支払いステータスを承認に変更するスクリプト
 * 
 * 使用方法:
 *   npm run confirm:payment <paymentId>
 *   または
 *   npx ts-node scripts/confirm-payment.ts <paymentId>
 * 
 * 例:
 *   npm run confirm:payment 1
 */

import { PaymentService } from '../src/services/payment.service';

const paymentService = new PaymentService();

async function confirmPayment(paymentId: number) {
    try {
        console.log(`\n🔄 支払いID ${paymentId} の承認処理を開始します...\n`);

        const result = await paymentService.confirmPayment(BigInt(paymentId));

        console.log('✅ 支払いが正常に承認されました！\n');
        console.log('📋 更新内容:');
        console.log(`   - 支払いID: ${result.id}`);
        console.log(`   - 契約ID: ${result.contractId}`);
        console.log(`   - 薬局ID: ${result.pharmacyId}`);
        console.log(`   - ステータス: confirmed（確認済み）\n`);
        console.log('💡 契約ステータスも「active（勤務中）」に更新されました。\n');

        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ エラーが発生しました:\n');
        console.error(`   ${error.message}\n`);

        if (error.message.includes('見つかりません')) {
            console.log('💡 支払いIDが正しいか確認してください。');
        } else if (error.message.includes('報告されていません')) {
            console.log('💡 支払いステータスが「reported（支払い報告済み）」である必要があります。');
            console.log('   現在のステータスを確認してください。\n');
        }

        process.exit(1);
    }
}

// コマンドライン引数から支払いIDを取得
const paymentIdArg = process.argv[2];

if (!paymentIdArg) {
    console.error('\n❌ エラー: 支払いIDが指定されていません。\n');
    console.log('📖 使用方法:');
    console.log('   npm run confirm:payment <paymentId>');
    console.log('   または');
    console.log('   npx ts-node scripts/confirm-payment.ts <paymentId>\n');
    console.log('📝 例:');
    console.log('   npm run confirm:payment 1\n');
    process.exit(1);
}

const paymentId = parseInt(paymentIdArg, 10);

if (isNaN(paymentId) || paymentId <= 0) {
    console.error('\n❌ エラー: 有効な支払いIDを指定してください。\n');
    process.exit(1);
}

confirmPayment(paymentId);

