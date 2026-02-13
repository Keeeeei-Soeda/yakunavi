import prisma from '../utils/prisma';

interface UpdateProfileInput {
  // 基本情報
  lastName?: string;
  firstName?: string;
  phoneNumber?: string;
  address?: string;
  birthDate?: Date | string;
  age?: number;
  nearestStation?: string;

  // 学歴
  university?: string;
  graduationYear?: number;

  // 資格情報
  licenseNumber?: string;
  licenseYear?: number;
  certifiedPharmacistLicense?: string;
  otherLicenses?: string;

  // 経歴
  workExperienceYears?: number;
  workExperienceMonths?: number;
  workExperienceTypes?: string[];
  mainDuties?: string[];

  // スキル・専門分野
  specialtyAreas?: string[];
  pharmacySystems?: string[];
  specialNotes?: string;

  // 自己紹介
  selfIntroduction?: string;
}

export class PharmacistProfileService {
  /**
   * プロフィールを取得
   */
  async getProfile(pharmacistId: bigint) {
    const pharmacist = await prisma.pharmacist.findUnique({
      where: { id: pharmacistId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            emailVerified: true,
            isActive: true,
          },
        },
        certificates: true,
      },
    });

    if (!pharmacist) {
      throw new Error('薬剤師プロフィールが見つかりません');
    }

    return {
      ...pharmacist,
      id: Number(pharmacist.id),
      userId: Number(pharmacist.userId),
      user: {
        ...pharmacist.user,
        id: Number(pharmacist.user.id),
      },
      certificates: pharmacist.certificates.map((cert: any) => ({
        ...cert,
        id: Number(cert.id),
        pharmacistId: Number(cert.pharmacistId),
        verifiedBy: cert.verifiedBy ? Number(cert.verifiedBy) : null,
      })),
    };
  }

  /**
   * プロフィールを更新
   */
  async updateProfile(pharmacistId: bigint, input: UpdateProfileInput) {
    // 更新不可能なフィールドを除外
    const excludeFields = [
      'id',
      'userId',
      'user',
      'certificates',
      'verificationStatus',
      'verifiedAt',
      'createdAt',
      'updatedAt',
    ];

    // 許可されたフィールドのみを抽出
    const updateData: any = {};
    Object.keys(input).forEach((key) => {
      if (!excludeFields.includes(key)) {
        updateData[key] = (input as any)[key];
      }
    });

    // birthDateが文字列の場合はDateに変換
    if (updateData.birthDate && typeof updateData.birthDate === 'string') {
      updateData.birthDate = new Date(updateData.birthDate);
    }

    try {
      const pharmacist = await prisma.pharmacist.update({
        where: { id: pharmacistId },
        data: updateData,
      });

      return {
        ...pharmacist,
        id: Number(pharmacist.id),
        userId: Number(pharmacist.userId),
      };
    } catch (error: any) {
      console.error('Prisma update error:', error);
      throw new Error(`プロフィールの更新に失敗しました: ${error.message}`);
    }
  }

  /**
   * 証明書をアップロード
   */
  async uploadCertificate(
    pharmacistId: bigint,
    certificateType: string,
    filePath: string,
    fileName: string
  ) {
    // 既存の証明書を削除（同じタイプの場合）
    await prisma.certificate.deleteMany({
      where: {
        pharmacistId,
        certificateType,
      },
    });

    // 新しい証明書を作成
    const certificate = await prisma.certificate.create({
      data: {
        pharmacistId,
        certificateType,
        filePath,
        fileName,
        uploadedAt: new Date(),
        verificationStatus: 'pending',
      },
    });

    return {
      ...certificate,
      id: Number(certificate.id),
      pharmacistId: Number(certificate.pharmacistId),
    };
  }

  /**
   * 証明書一覧を取得
   */
  async getCertificates(pharmacistId: bigint) {
    const certificates = await prisma.certificate.findMany({
      where: { pharmacistId },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return certificates.map((cert: any) => ({
      ...cert,
      id: Number(cert.id),
      pharmacistId: Number(cert.pharmacistId),
      verifiedBy: cert.verifiedBy ? Number(cert.verifiedBy) : null,
    }));
  }

  /**
   * 証明書を削除
   */
  async deleteCertificate(certificateId: bigint, pharmacistId: bigint) {
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
    });

    if (!certificate) {
      throw new Error('証明書が見つかりません');
    }

    if (certificate.pharmacistId !== pharmacistId) {
      throw new Error('この証明書を削除する権限がありません');
    }

    await prisma.certificate.delete({
      where: { id: certificateId },
    });

    return {
      id: Number(certificateId),
      message: '証明書を削除しました',
    };
  }

  /**
   * 証明書確認ステータスを取得
   */
  async getVerificationStatus(pharmacistId: bigint) {
    const certificates = await prisma.certificate.findMany({
      where: { pharmacistId },
    });

    const status = {
      license: certificates.find((c) => c.certificateType === 'license'),
      registration: certificates.find((c) => c.certificateType === 'registration'),
    };

    return {
      license: status.license
        ? {
          status: status.license.verificationStatus,
          uploadedAt: status.license.uploadedAt,
        }
        : null,
      registration: status.registration
        ? {
          status: status.registration.verificationStatus,
          uploadedAt: status.registration.uploadedAt,
        }
        : null,
    };
  }
}

