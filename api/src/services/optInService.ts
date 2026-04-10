import { PrismaClient, Prisma } from "@prisma/client";
import { generateOptInId } from "../utils/caseIdGenerator";
import { logActivity } from "./activityService";

const prisma = new PrismaClient();

interface CreateOptInInput {
  emailAddress: string;
  complainantName?: string | null;
  complainantCountry?: string | null;
  gender?: string | null;
  soiTimestamp?: string | null;
  doiTimestamp?: string | null;
  responseDeadline?: string | null;
  reason?: string | null;
  notes?: string | null;
  galaxyData?: Record<string, unknown>;
  linkedCaseId?: string;
}

interface ListOptInParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export async function createOptInRequest(
  input: CreateOptInInput,
  actorId: string
) {
  const requestId = await generateOptInId();

  const optIn = await prisma.optInRequest.create({
    data: {
      requestId,
      emailAddress: input.emailAddress,
      complainantName: input.complainantName ?? null,
      complainantCountry: input.complainantCountry ?? null,
      gender: input.gender ?? null,
      soiTimestamp: input.soiTimestamp ? new Date(input.soiTimestamp) : null,
      doiTimestamp: input.doiTimestamp ? new Date(input.doiTimestamp) : null,
      responseDeadline: input.responseDeadline ? new Date(input.responseDeadline) : null,
      reason: input.reason ?? null,
      notes: input.notes ?? null,
      galaxyData: input.galaxyData || undefined,
      requestedById: actorId,
    },
  });

  await logActivity({
    action: "opt_in_created",
    actorId,
    optInRequestId: optIn.id,
    details: { requestId: optIn.requestId, emailAddress: optIn.emailAddress },
  });

  return optIn;
}

export async function getOptInRequest(idOrRequestId: string) {
  // Accept either the UUID id or the human-readable requestId (OPT-YYYY-NNNN)
  const isHumanId = /^OPT-\d{4}-\d+$/i.test(idOrRequestId);
  return prisma.optInRequest.findUnique({
    where: isHumanId ? { requestId: idOrRequestId.toUpperCase() } : { id: idOrRequestId },
    include: {
      requestedBy: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      linkedCase: true,
      documents: {
        include: {
          uploadedBy: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { uploadedAt: "desc" },
      },
      activityLogs: {
        include: {
          actor: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function listOptInRequests(params: ListOptInParams) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.OptInRequestWhereInput = {};

  if (params.search) {
    const search = params.search;
    where.OR = [
      { requestId: { contains: search, mode: "insensitive" } },
      { emailAddress: { contains: search, mode: "insensitive" } },
    ];
  }

  if (params.status?.length) {
    where.status = { in: params.status as any[] };
  }

  if (params.dateFrom || params.dateTo) {
    where.dateRequested = {};
    if (params.dateFrom) {
      where.dateRequested.gte = new Date(params.dateFrom);
    }
    if (params.dateTo) {
      where.dateRequested.lte = new Date(params.dateTo);
    }
  }

  const [requests, total] = await Promise.all([
    prisma.optInRequest.findMany({
      where,
      include: {
        requestedBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.optInRequest.count({ where }),
  ]);

  return {
    data: requests,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateOptInRequest(
  id: string,
  data: Record<string, any>,
  actorId: string
) {
  const existing = await prisma.optInRequest.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Opt-in request not found");
  }

  // Handle sixpgSubmitted toggle
  if (data.sixpgSubmitted === true && !existing.sixpgSubmitted) {
    data.sixpgSubmittedAt = new Date();
  }

  // Convert date strings
  const dateFields = [
    "dateRequested",
    "sixpgSubmittedAt",
    "soiTimestamp",
    "doiTimestamp",
    "responseDeadline",
  ];
  for (const field of dateFields) {
    if (data[field] && typeof data[field] === "string") {
      data[field] = new Date(data[field]);
    }
  }

  const updated = await prisma.optInRequest.update({
    where: { id },
    data,
  });

  // Log status change separately
  if (data.status && data.status !== existing.status) {
    await logActivity({
      action: "opt_in_status_changed",
      actorId,
      optInRequestId: id,
      details: { from: existing.status, to: data.status },
    });
  }

  // Log general updates
  const changedFields = Object.keys(data).filter((k) => k !== "status");
  if (changedFields.length > 0) {
    await logActivity({
      action: "opt_in_updated",
      actorId,
      optInRequestId: id,
      details: { fields: changedFields },
    });
  }

  return updated;
}

export async function deleteOptInRequest(id: string, actorId: string) {
  const existing = await prisma.optInRequest.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Opt-in request not found");
  }

  await logActivity({
    action: "opt_in_deleted",
    actorId,
    optInRequestId: id,
    details: { requestId: existing.requestId, emailAddress: existing.emailAddress },
  });

  await prisma.optInRequest.delete({ where: { id } });

  return { success: true };
}
