import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generateCaseId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `LEGAL-${year}-`;

  const lastCase = await prisma.legalCase.findFirst({
    where: { caseId: { startsWith: prefix } },
    orderBy: { caseId: "desc" },
    select: { caseId: true },
  });

  let nextNumber = 1;
  if (lastCase) {
    const lastNumber = parseInt(lastCase.caseId.split("-")[2], 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
}

export async function generateOptInId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `OPT-${year}-`;

  const lastRequest = await prisma.optInRequest.findFirst({
    where: { requestId: { startsWith: prefix } },
    orderBy: { requestId: "desc" },
    select: { requestId: true },
  });

  let nextNumber = 1;
  if (lastRequest) {
    const lastNumber = parseInt(lastRequest.requestId.split("-")[2], 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
}
