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

// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ミドルウェア
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
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

// エラーハンドラー
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
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
