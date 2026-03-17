import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminAccount() {
  try {
    console.log('管理者アカウントを作成しています...');

    // 管理者情報
    const adminEmail = 'admin@yaku-navi.com';
    const adminPassword = 'Admin@2026!'; // 強力なパスワード
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 既存の管理者アカウントをチェック
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('❌ 既に管理者アカウントが存在します:', adminEmail);
      console.log('既存のアカウントを更新しますか？');
      
      // 既存アカウントを管理者に更新
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          userType: 'admin',
          isActive: true,
        },
      });
      console.log('✅ 既存アカウントを管理者に更新しました');
    } else {
      // 新規管理者アカウントを作成
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          userType: 'admin',
          isActive: true,
          emailVerified: true,
        },
      });

      console.log('\n✅ 管理者アカウントが作成されました！');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 メールアドレス:', adminEmail);
      console.log('🔑 パスワード:', adminPassword);
      console.log('👤 ユーザーID:', admin.id.toString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n⚠️  このパスワードは必ず安全な場所に保管してください！');
      console.log('🔗 ログインURL: http://localhost:3000/admin/auth/login');
    }

    // 追加の管理者アカウントを作成（オプション）
    const secondAdminEmail = 'support@yaku-navi.com';
    const secondAdminPassword = 'Support@2026!';
    const secondHashedPassword = await bcrypt.hash(secondAdminPassword, 10);

    const existingSecondAdmin = await prisma.user.findUnique({
      where: { email: secondAdminEmail },
    });

    if (!existingSecondAdmin) {
      const secondAdmin = await prisma.user.create({
        data: {
          email: secondAdminEmail,
          password: secondHashedPassword,
          userType: 'admin',
          isActive: true,
          emailVerified: true,
        },
      });

      console.log('\n✅ 第2管理者アカウントが作成されました！');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 メールアドレス:', secondAdminEmail);
      console.log('🔑 パスワード:', secondAdminPassword);
      console.log('👤 ユーザーID:', secondAdmin.id.toString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminAccount()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

