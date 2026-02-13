'use client';

import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

// PDF.js workerの設定
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface PDFViewerProps {
  file: Blob | string;
  fileName?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ file, fileName }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    setPageNumber(1); // 最初のページにリセット
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    setError('PDFの読み込みに失敗しました');
    setLoading(false);
  }, []);

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (file instanceof Blob) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'certificate.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex h-[600px] border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* 左側: ページ一覧（サムネイル） */}
      <div className="w-48 border-r border-gray-300 bg-gray-50 overflow-y-auto">
        <div className="p-3">
          <h5 className="text-sm font-medium text-gray-700 mb-2">ページ一覧</h5>
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="text-xs text-gray-500 text-center py-4">読み込み中...</div>}
          >
            {loading ? (
              <div className="text-xs text-gray-500 text-center py-4">読み込み中...</div>
            ) : error ? (
              <div className="text-xs text-red-500 text-center py-4">{error}</div>
            ) : (
              <div className="space-y-2">
                {Array.from({ length: numPages }, (_, index) => (
                  <div
                    key={index + 1}
                    onClick={() => setPageNumber(index + 1)}
                    className={`cursor-pointer p-2 rounded border transition-colors ${
                      pageNumber === index + 1
                        ? 'bg-blue-100 border-blue-500'
                        : 'bg-white border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-xs text-gray-600 mb-1">ページ {index + 1}</div>
                    <Page
                      pageNumber={index + 1}
                      width={120}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="border border-gray-200 rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </Document>
        </div>
      </div>

      {/* 右側: メインPDF表示エリア */}
      <div className="flex-1 flex flex-col">
        {/* ツールバー */}
        <div className="flex items-center justify-between p-3 border-b border-gray-300 bg-gray-50">
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="縮小"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-sm text-gray-700 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={scale >= 3.0}
              className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="拡大"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={rotate}
              className="p-2 rounded hover:bg-gray-200"
              title="回転"
            >
              <RotateCw size={18} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">
              {pageNumber} / {numPages || 0}
            </span>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
              title="ダウンロード"
            >
              <Download size={16} />
              ダウンロード
            </button>
          </div>
        </div>

        {/* PDF表示エリア */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
          {loading && !error ? (
            <div className="text-gray-500">PDFを読み込み中...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div className="text-gray-500">読み込み中...</div>}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
              />
            </Document>
          )}
        </div>

        {/* ページナビゲーション */}
        {numPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-2 border-t border-gray-300 bg-gray-50">
            <button
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              disabled={pageNumber <= 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              前へ
            </button>
            <span className="text-sm text-gray-700 px-4">
              {pageNumber} / {numPages}
            </span>
            <button
              onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
              disabled={pageNumber >= numPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

