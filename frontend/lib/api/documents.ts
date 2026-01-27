import { apiClient } from './client';
import { APIResponse } from './auth';

export interface Document {
  id: number;
  contractId: number;
  documentType: string;
  filePath: string;
  fileUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadedByPharmacy: boolean;
  downloadedByPharmacist: boolean;
  pharmacyDownloadedAt?: string;
  pharmacistDownloadedAt?: string;
  createdAt: string;
}

export const documentsAPI = {
  /**
   * 契約に紐づくドキュメント一覧を取得
   */
  getByContract: async (contractId: number) => {
    return apiClient.get<APIResponse<Document[]>>(`/documents/contract/${contractId}`);
  },

  /**
   * ドキュメントをダウンロード
   * @param documentId ドキュメントID
   * @param userType ユーザータイプ（'pharmacy' または 'pharmacist'）
   * @param fileName ダウンロード時のファイル名
   */
  download: async (documentId: number, userType: 'pharmacy' | 'pharmacist', fileName?: string) => {
    try {
      // 認証トークンを取得
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        throw new Error('認証トークンが見つかりません');
      }

      // APIエンドポイントURL
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const url = `${API_URL}/documents/${documentId}/download?userType=${userType}`;

      // fetchでBlobを取得
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ダウンロードに失敗しました');
      }

      // Blobとしてレスポンスを取得
      const blob = await response.blob();

      // ファイル名を取得（Content-Dispositionヘッダーから、またはデフォルト）
      let downloadFileName = fileName || `document-${documentId}.pdf`;
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*=UTF-8''(.+)/);
        if (match && match[1]) {
          downloadFileName = decodeURIComponent(match[1]);
        } else {
          const simpleMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (simpleMatch && simpleMatch[1]) {
            downloadFileName = simpleMatch[1];
          }
        }
      }

      // Blob URLを作成してダウンロード
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = downloadFileName;
      document.body.appendChild(a);
      a.click();
      
      // クリーンアップ
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);

      return {
        success: true,
        message: 'ダウンロードに成功しました',
      };
    } catch (error: any) {
      console.error('Download error:', error);
      return {
        success: false,
        error: error.message || 'ダウンロードに失敗しました',
      };
    }
  },

  /**
   * シンプルなダウンロード（新しいタブで開く）
   * 認証が不要な場合や、ブラウザにファイルを表示したい場合に使用
   */
  downloadSimple: (documentId: number, userType: 'pharmacy' | 'pharmacist') => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const url = `${API_URL}/documents/${documentId}/download?userType=${userType}`;
    window.open(url, '_blank');
  },
};

