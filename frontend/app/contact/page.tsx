'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api/client';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    occupation: '',
    content: '',
    email: '',
    phone: '',
    privacyAgreed: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await apiClient.post('/contact', {
        name: formData.name,
        age: formData.age,
        occupation: formData.occupation,
        content: formData.content,
        email: formData.email,
        phone: formData.phone,
      });
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        age: '',
        occupation: '',
        content: '',
        email: '',
        phone: '',
        privacyAgreed: false
      });
    } catch (error: any) {
      console.error('Contact submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* ヘッダー */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center">
              <div className="h-12 w-auto flex items-center">
                <Image
                  src="/logo_yakunavi.png"
                  alt="薬ナビ"
                  width={120}
                  height={48}
                  className="h-12 w-auto"
                />
              </div>
            </Link>
            <div className="flex items-center space-x-3">
              <Link
                href="/contact"
                className="text-gray-700 hover:text-teal-600 transition-colors text-sm font-medium"
              >
                お問い合わせ
              </Link>
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-teal-600 transition-colors text-sm"
              >
                ログイン
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/auth/register/pharmacist"
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all inline-block"
                >
                  💊 薬剤師登録
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/auth/register/pharmacy"
                  className="px-4 py-2 bg-white text-teal-600 border-2 border-teal-500 rounded-full text-sm font-medium hover:bg-teal-50 transition-all inline-block"
                >
                  🏥 薬局登録
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* メインコンテンツ */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
              お問い合わせ
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              ご質問やご相談がございましたら、お気軽にお問い合わせください
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-xl">
                <p className="text-teal-700 font-medium">
                  お問い合わせありがとうございます。担当者よりご連絡させていただきます。
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 font-medium">
                  送信に失敗しました。もう一度お試しください。
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 氏名 */}
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="山田 太郎"
                />
              </div>

              {/* 年齢 */}
              <div>
                <label htmlFor="age" className="block text-sm font-bold text-gray-700 mb-2">
                  年齢 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="18"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="30"
                />
              </div>

              {/* 職種 */}
              <div>
                <label htmlFor="occupation" className="block text-sm font-bold text-gray-700 mb-2">
                  職種 <span className="text-red-500">*</span>
                </label>
                <select
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">選択してください</option>
                  <option value="pharmacist">薬剤師</option>
                  <option value="pharmacy">薬局</option>
                  <option value="other">その他医療従事者</option>
                </select>
              </div>

              {/* メールアドレス */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="example@email.com"
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="090-1234-5678"
                />
              </div>

              {/* 問い合わせ内容 */}
              <div>
                <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-2">
                  問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                  placeholder="お問い合わせ内容をご記入ください"
                />
              </div>

              {/* 個人情報取扱規約同意 */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="privacyAgreed"
                  name="privacyAgreed"
                  checked={formData.privacyAgreed}
                  onChange={handleChange}
                  required
                  className="mt-1 w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="privacyAgreed" className="text-sm text-gray-700">
                  <span className="text-red-500">*</span>{' '}
                  <Link href="/privacy" className="text-teal-600 hover:text-teal-700 underline">
                    個人情報取扱規約
                  </Link>
                  に同意します
                </label>
              </div>

              {/* 送信ボタン */}
              <motion.div
                className="pt-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.privacyAgreed}
                  className="w-full px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '送信中...' : '送信する'}
                </button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-4">薬ナビ</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                理想のキャリアを実現する転職支援サービス
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base mb-4">サービス</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-teal-400 transition-colors">おためし転職</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base mb-4">会社情報</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-teal-400 transition-colors">会社概要</Link></li>
                <li><Link href="/contact" className="hover:text-teal-400 transition-colors">お問い合わせ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base mb-4">その他</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><Link href="/terms" className="hover:text-teal-400 transition-colors">利用規約</Link></li>
                <li><Link href="/privacy" className="hover:text-teal-400 transition-colors">プライバシーポリシー</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2026 薬ナビ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

