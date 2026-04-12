import { PrismaClient, Prisma } from "@prisma/client";
import { generateCaseId } from "../utils/caseIdGenerator";
import { logActivity } from "./activityService";

const prisma = new PrismaClient();

interface CreateCaseInput {
  title: string;
  complainantEmail: string;
  complainantName?: string | null;
  complainantCountry?: string | null;
  lawyerName?: string | null;
  lawyerFirm?: string | null;
  lawyerEmail?: string | null;
  lawyerPhone?: string | null;
  dateReceived: string;
  sourceEmailSubject?: string | null;
  sourceGmailThreadId?: string | null;
  source?: string;
  sourceOther?: string | null;
  caseType?: string;
  caseTypeOther?: string | null;
  jurisdiction?: string | null;
  riskLevel?: string | null;
  status?: string;
  responseDeadline?: string | null;
  internalDeadline?: string | null;
  followUpDate?: string | null;
  assignedToId?: string | null;
  linkedOptInRequestId?: string | null;
}

interface ListCasesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string[];
  caseType?: string[];
  riskLevel?: string[];
  jurisdiction?: string;
  assignedToId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function createCase(input: CreateCaseInput, actorId: string) {
  const caseId = await generateCaseId();

  const legalCase = await prisma.legalCase.create({
    data: {
      caseId,
      title: input.title,
      complainantEmail: input.complainantEmail,
      complainantName: input.complainantName,
      complainantCountry: input.complainantCountry,
      lawyerName: input.lawyerName,
      lawyerFirm: input.lawyerFirm,
      lawyerEmail: input.lawyerEmail,
      lawyerPhone: input.lawyerPhone,
      dateReceived: new Date(input.dateReceived),
      sourceEmailSubject: input.sourceEmailSubject,
      sourceGmailThreadId: input.sourceGmailThreadId,
      source: input.source as any,
      sourceOther: input.sourceOther ?? null,
      caseType: input.caseType as any,
      caseTypeOther: input.caseTypeOther ?? null,
      jurisdiction: input.jurisdiction,
      riskLevel: input.riskLevel as any,
      status: (input.status as any) || "new",
      responseDeadline: input.responseDeadline ? new Date(input.responseDeadline) : null,
      internalDeadline: input.internalDeadline ? new Date(input.internalDeadline) : null,
      followUpDate: input.followUpDate ? new Date(input.followUpDate) : null,
      assignedToId: input.assignedToId,
      linkedOptInRequestId: input.linkedOptInRequestId,
    },
  });

  await logActivity({
    action: "case_created",
    actorId,
    caseId: legalCase.id,
    details: { caseId: legalCase.caseId, title: legalCase.title },
  });

  return legalCase;
}

export async function getCase(idOrCaseId: string) {
  // Accept either the UUID id or the human-readable caseId (LEGAL-YYYY-NNNN)
  const isHumanId = /^LEGAL-\d{4}-\d+$/i.test(idOrCaseId);
  return prisma.legalCase.findUnique({
    where: isHumanId ? { caseId: idOrCaseId.toUpperCase() } : { id: idOrCaseId },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      nextActionOwner: {
        select: { id: true, name: true, avatarUrl: true },
      },
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
      linkedOptInRequest: true,
    },
  });
}

export async function listCases(params: ListCasesParams) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.LegalCaseWhereInput = {};

  if (params.search) {
    const search = params.search;
    where.OR = [
      { caseId: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { complainantEmail: { contains: search, mode: "insensitive" } },
      { complainantName: { contains: search, mode: "insensitive" } },
      { lawyerName: { contains: search, mode: "insensitive" } },
      { lawyerFirm: { contains: search, mode: "insensitive" } },
    ];
  }

  if (params.status?.length) {
    where.status = { in: params.status as any[] };
  }

  if (params.caseType?.length) {
    where.caseType = { in: params.caseType as any[] };
  }

  if (params.riskLevel?.length) {
    where.riskLevel = { in: params.riskLevel as any[] };
  }

  if (params.jurisdiction) {
    where.jurisdiction = { contains: params.jurisdiction, mode: "insensitive" };
  }

  if (params.assignedToId) {
    where.assignedToId = params.assignedToId;
  }

  if (params.dateFrom || params.dateTo) {
    where.dateReceived = {};
    if (params.dateFrom) {
      where.dateReceived.gte = new Date(params.dateFrom);
    }
    if (params.dateTo) {
      where.dateReceived.lte = new Date(params.dateTo);
    }
  }

  const [cases, total] = await Promise.all([
    prisma.legalCase.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, avatarUrl: true },
        },
        nextActionOwner: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.legalCase.count({ where }),
  ]);

  return {
    data: cases,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateCase(
  id: string,
  data: Record<string, any>,
  actorId: string
) {
  const existing = await prisma.legalCase.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Case not found");
  }

  // Convert date strings to Date objects
  const dateFields = [
    "dateReceived",
    "responseDeadline",
    "internalDeadline",
    "followUpDate",
    "dateEscalated",
    "nextActionDeadline",
  ];
  for (const field of dateFields) {
    if (data[field] !== undefined) {
      data[field] = data[field] ? new Date(data[field]) : null;
    }
  }

  const updated = await prisma.legalCase.update({
    where: { id },
    data,
  });

  // Log status change separately
  if (data.status && data.status !== existing.status) {
    await logActivity({
      action: "status_changed",
      actorId,
      caseId: id,
      details: { from: existing.status, to: data.status },
    });
  }

  // Log general field updates
  const changedFields = Object.keys(data).filter((k) => k !== "status");
  if (changedFields.length > 0) {
    await logActivity({
      action: "case_updated",
      actorId,
      caseId: id,
      details: { fields: changedFields },
    });
  }

  return updated;
}

export async function deleteCase(id: string, actorId: string) {
  const existing = await prisma.legalCase.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Case not found");
  }

  await logActivity({
    action: "case_deleted",
    actorId,
    caseId: id,
    details: { caseId: existing.caseId, title: existing.title },
  });

  await prisma.legalCase.delete({ where: { id } });

  return { success: true };
}
