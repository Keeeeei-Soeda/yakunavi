import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, UserType } from '../types';

// カスタムRequestインターフェース
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

// JWT検証ミドルウェア
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'トークンが提供されていません'
      });
      return;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined');
      res.status(500).json({
        error: 'Server Configuration Error',
        message: 'サーバー設定エラー'
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: '無効なトークンです'
    });
  }
};

// ユーザータイプ検証ミドルウェア
export const requireUserType = (...allowedTypes: UserType[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: '認証が必要です'
      });
      return;
    }

    if (!allowedTypes.includes(req.user.userType as UserType)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'このリソースへのアクセス権限がありません'
      });
      return;
    }

    next();
  };
};

// ユーザータイプ認可ミドルウェア（別名エクスポート）
export const authorizeUserType = requireUserType;

