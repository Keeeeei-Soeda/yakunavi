import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export type AuditAction =
  | 'job_posting.create'
  | 'job_posting.update'
  | 'job_posting.publish'
  | 'job_posting.unpublish'
  | 'job_posting.delete';

interface LogParams {
  userId: bigint;
  action: AuditAction;
  resourceType: string;
  resourceId?: bigint;
  pharmacyId?: bigint;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  resourceType?: string;
  pharmacyId?: bigint;
  action?: string;
}

export class AuditLogService {
  async log(params: LogParams) {
    const entry = await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId ?? null,
        pharmacyId: params.pharmacyId ?? null,
        details: (params.details as Prisma.InputJsonValue) ?? undefined,
        ipAddress: params.ipAddress ?? null,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, email: true, userType: true },
    });

    return {
      ...entry,
      id: Number(entry.id),
      userId: Number(entry.userId),
      resourceId: entry.resourceId ? Number(entry.resourceId) : null,
      pharmacyId: entry.pharmacyId ? Number(entry.pharmacyId) : null,
      user: user
        ? {
            ...user,
            id: Number(user.id),
          }
        : null,
    };
  }

  async getAuditLogs(params: GetAuditLogsParams) {
    const { page = 1, limit = 20, resourceType, pharmacyId, action } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (resourceType) where.resourceType = resourceType;
    if (pharmacyId) where.pharmacyId = pharmacyId;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, userType: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map((log) => ({
        id: Number(log.id),
        userId: Number(log.userId),
        action: log.action,
        resourceType: log.resourceType,
        resourceId: log.resourceId ? Number(log.resourceId) : null,
        pharmacyId: log.pharmacyId ? Number(log.pharmacyId) : null,
        details: log.details,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
        user: {
          id: Number(log.user.id),
          email: log.user.email,
          userType: log.user.userType,
        },
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
