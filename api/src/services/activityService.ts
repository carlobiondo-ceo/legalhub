import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface LogActivityParams {
  action: string;
  actorId: string;
  caseId?: string;
  optInRequestId?: string;
  details?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams) {
  return prisma.activityLog.create({
    data: {
      action: params.action,
      actorId: params.actorId,
      caseId: params.caseId || null,
      optInRequestId: params.optInRequestId || null,
      details: params.details || null,
    },
  });
}

export async function getActivityForCase(caseId: string) {
  return prisma.activityLog.findMany({
    where: { caseId },
    include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActivityForOptIn(optInRequestId: string) {
  return prisma.activityLog.findMany({
    where: { optInRequestId },
    include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecentActivity(limit: number = 20) {
  return prisma.activityLog.findMany({
    include: {
      actor: { select: { id: true, name: true, avatarUrl: true } },
      case: { select: { id: true, caseId: true, title: true } },
      optInRequest: { select: { id: true, requestId: true, emailAddress: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
