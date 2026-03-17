import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import jobPostingRoutes from './routes/job-posting.routes';
import applicationRoutes from './routes/application.routes';
import messageRoutes from './routes/message.routes';
import contractRoutes from './routes/contract.routes';
import paymentRoutes from './routes/payment.routes';
import documentRoutes from './routes/document.routes';
import pharmacistProfileRoutes from './routes/pharmacist-profile.routes';
import pharmacyRoutes from './routes/pharmacy.routes';
import pharmacistRoutes from './routes/pharmacist.routes';
import contactRoutes from './routes/contact.routes';
import adminRoutes from './routes/admin.routes';

// 環境変数の読み込み
dotenv.config();

// BigInt を JSON.stringify で数値として出力できるようにする
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

const app = express();
const PORT = process.env.PORT || 5001;

// ミドルウェア
// CORS設定：開発環境では複数のポートを許可
const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
    ];

app.use(cors({
    origin: (origin, callback) => {
        // デバッグログ
        console.log(`[CORS] Request from origin: ${origin || 'none (server-side)'}`);

        // オリジンが未指定（Postman等、サーバーサイドリクエスト）の場合は許可
        if (!origin) {
            console.log(`[CORS] Allowing request without origin`);
            return callback(null, true);
        }

        // 開発環境では localhost と 127.0.0.1 からのリクエストを全て許可
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            console.log(`[CORS] Allowing local origin: ${origin}`);
            return callback(null, true);
        }

        // 本番環境では許可リストをチェック
        if (allowedOrigins.includes(origin)) {
            console.log(`[CORS] Allowing origin: ${origin}`);
            return callback(null, true);
        }

        // 許可されていないオリジンの場合
        console.warn(`[CORS] Blocked origin: ${origin}`);
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200, // レガシーブラウザ対応
}));

// OPTIONSリクエストのデバッグログ
app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
        console.log(`[OPTIONS] ${req.path} from ${req.headers.origin}`);
    }
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルートの登録
app.use('/api/auth', authRoutes);
app.use('/api/job-postings', jobPostingRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/pharmacist-profiles', pharmacistProfileRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/pharmacist', pharmacistRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// ヘルスチェック
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// 404ハンドラー
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});

// エラーハンドラー（CORSエラーを適切に処理）
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // CORSエラーの場合は適切なステータスコードを返す
    if (err.message === 'Not allowed by CORS' || err.name === 'CORS') {
        console.warn(`CORS error: ${req.headers.origin}`);
        return res.status(403).json({
            success: false,
            error: 'CORS policy violation',
            message: 'このオリジンからのアクセスは許可されていません',
        });
    }

    console.error('Error:', err);
    return res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error',
    });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📝 API URL: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app;
