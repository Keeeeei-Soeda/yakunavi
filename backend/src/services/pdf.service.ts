import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

interface InvoiceData {
    invoiceNumber: string;
    issueDate: Date;
    pharmacyName: string;
    pharmacyAddress: string;
    pharmacyPhone: string;
    contractNumber: string;
    pharmacistName: string;
    workDays: number;
    initialWorkDate: Date;
    serviceCharge: number;
    platformFee: number;
    totalAmount: number;
    paymentDeadline: Date;
}

export class PDFService {
    /**
     * プラットフォーム手数料請求書を生成
     */
    generateInvoice(data: InvoiceData): PassThrough {
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const stream = new PassThrough();
        doc.pipe(stream);

        // タイトル
        doc.fontSize(20).text('プラットフォーム手数料 請求書', { align: 'center' });
        doc.fontSize(10).text('Platform Fee Invoice', { align: 'center' });
        doc.moveDown(2);

        // 請求書番号と発行日
        doc.fontSize(10);
        const rightX = 400;
        doc.text('請求書番号', 50, doc.y);
        doc.text('発行日', rightX, doc.y - 12, { width: 150, align: 'right' });
        
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(data.invoiceNumber, 50, doc.y);
        doc.text(this.formatDate(data.issueDate), rightX, doc.y - 12, { width: 150, align: 'right' });
        
        doc.font('Helvetica').fontSize(10);
        doc.moveDown(2);

        // 請求先
        doc.text('請求先');
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text(`${data.pharmacyName} 御中`, { indent: 10 });
        doc.fontSize(10).font('Helvetica');
        doc.text(data.pharmacyAddress, { indent: 10 });
        doc.text(`TEL: ${data.pharmacyPhone}`, { indent: 10 });
        doc.moveDown(2);

        // 契約情報
        doc.fontSize(12).font('Helvetica-Bold').text('契約情報');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');
        
        const leftCol = 50;
        const rightCol = 300;
        let currentY = doc.y;

        doc.text('契約番号', leftCol, currentY);
        doc.text('薬剤師名', rightCol, currentY);
        currentY += 15;
        
        doc.font('Helvetica-Bold');
        doc.text(data.contractNumber, leftCol, currentY);
        doc.text(`${data.pharmacistName} 様`, rightCol, currentY);
        currentY += 20;

        doc.font('Helvetica');
        doc.text('勤務予定日数', leftCol, currentY);
        doc.text('初回勤務予定日', rightCol, currentY);
        currentY += 15;

        doc.font('Helvetica-Bold');
        doc.text(`${data.workDays}日`, leftCol, currentY);
        doc.text(this.formatDate(data.initialWorkDate), rightCol, currentY);
        
        doc.font('Helvetica');
        doc.moveDown(2);

        // 請求内訳
        doc.fontSize(12).font('Helvetica-Bold').text('請求内訳');
        doc.moveDown(0.5);

        // テーブルヘッダー
        currentY = doc.y;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.rect(50, currentY, 495, 25).fillAndStroke('#f0f0f0', '#cccccc');
        doc.fillColor('#000000');
        doc.text('項目', 60, currentY + 8);
        doc.text('金額', 480, currentY + 8, { width: 55, align: 'right' });
        currentY += 25;

        // テーブル行
        doc.font('Helvetica').fontSize(10);
        
        // サービス利用料
        doc.rect(50, currentY, 495, 25).stroke('#cccccc');
        doc.text('薬剤師紹介サービス利用料', 60, currentY + 8);
        doc.text(this.formatCurrency(data.serviceCharge), 480, currentY + 8, { width: 55, align: 'right' });
        currentY += 25;

        // プラットフォーム手数料
        doc.rect(50, currentY, 495, 25).stroke('#cccccc');
        doc.text('プラットフォーム手数料（40%）', 60, currentY + 8);
        doc.text(this.formatCurrency(data.platformFee), 480, currentY + 8, { width: 55, align: 'right' });
        currentY += 25;

        doc.moveDown(1);

        // 合計金額
        currentY = doc.y;
        doc.rect(50, currentY, 495, 35).fill('#e6f2ff');
        doc.fillColor('#000000');
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('お支払い金額（税込）', 60, currentY + 10);
        doc.fontSize(16).fillColor('#0066cc');
        doc.text(this.formatCurrency(data.totalAmount), 480, currentY + 8, { width: 55, align: 'right' });
        doc.fillColor('#000000');
        
        doc.moveDown(2);

        // お振込先情報
        doc.fontSize(12).font('Helvetica-Bold').text('お振込先情報');
        doc.moveDown(0.5);

        currentY = doc.y;
        doc.rect(50, currentY, 495, 140).stroke('#0066cc').lineWidth(2);
        doc.lineWidth(1);
        
        doc.fontSize(10).font('Helvetica');
        currentY += 10;
        doc.text('銀行名:', 60, currentY);
        doc.text('三菱UFJ銀行', 150, currentY);
        currentY += 20;
        
        doc.text('支店名:', 60, currentY);
        doc.text('渋谷支店', 150, currentY);
        currentY += 20;
        
        doc.text('口座種別:', 60, currentY);
        doc.text('普通', 150, currentY);
        currentY += 20;
        
        doc.text('口座番号:', 60, currentY);
        doc.font('Helvetica-Bold').text('1234567', 150, currentY);
        currentY += 20;
        
        doc.font('Helvetica').text('口座名義:', 60, currentY);
        doc.text('カ）ヤクナビ', 150, currentY);
        currentY += 20;
        
        doc.text('お支払い期限:', 60, currentY);
        doc.font('Helvetica-Bold').fillColor('#cc0000');
        doc.text(this.formatDate(data.paymentDeadline), 150, currentY);
        doc.fillColor('#000000').font('Helvetica');

        doc.moveDown(2);

        // 重要事項
        doc.fontSize(12).font('Helvetica-Bold').text('重要事項');
        doc.moveDown(0.5);

        currentY = doc.y;
        doc.rect(50, currentY, 495, 80).fill('#fffbf0');
        doc.fillColor('#000000');

        doc.fontSize(9).font('Helvetica');
        currentY += 8;
        const notices = [
            'お支払い確認後、薬剤師の個人情報（連絡先、免許証情報等）が開示されます。',
            '期限内にお支払いが確認できない場合、契約がキャンセルされる場合があります。',
            `お振込の際は、請求書番号（${data.invoiceNumber}）をお振込名義人欄にご記入ください。`,
            '振込手数料は貴社にてご負担ください。',
        ];

        notices.forEach((notice, index) => {
            doc.text(`• ${notice}`, 60, currentY, { width: 475 });
            currentY += 18;
        });

        // フッター
        doc.moveDown(2);
        doc.fontSize(12).font('Helvetica-Bold').text('ヤクナビ運営事務局', { align: 'center' });
        doc.fontSize(9).font('Helvetica');
        doc.text('お問い合わせ: support@yakunavi.jp', { align: 'center' });
        doc.text('TEL: 0120-XXX-XXXX（平日 9:00-18:00）', { align: 'center' });

        doc.end();
        return stream;
    }

    /**
     * 労働条件通知書を生成
     */
    generateLaborConditionsNotice(data: any): PassThrough {
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const stream = new PassThrough();
        doc.pipe(stream);

        // タイトル
        doc.fontSize(20).text('労働条件通知書', { align: 'center' });
        doc.fontSize(10).text('Labor Conditions Notice', { align: 'center' });
        doc.moveDown(2);

        // 内容は今後実装
        doc.fontSize(12).text('※ この機能は準備中です', { align: 'center' });

        doc.end();
        return stream;
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString();
        const day = date.getDate().toString();
        return `${year}年${month}月${day}日`;
    }

    private formatCurrency(amount: number): string {
        return `¥${amount.toLocaleString('ja-JP')}`;
    }
}
