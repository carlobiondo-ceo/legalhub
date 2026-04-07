import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { logActivity } from "./activityService";

const prisma = new PrismaClient();

interface UploadDocumentInput {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  section: string;
  caseId?: string;
  optInRequestId?: string;
  uploadedById: string;
}

export async function uploadDocument(input: UploadDocumentInput) {
  // Check for existing file with same name + section for versioning
  const existingDoc = await prisma.caseDocument.findFirst({
    where: {
      fileName: input.fileName,
      section: input.section as any,
      caseId: input.caseId || undefined,
      optInRequestId: input.optInRequestId || undefined,
    },
    orderBy: { version: "desc" },
  });

  const version = existingDoc ? existingDoc.version + 1 : 1;

  const document = await prisma.caseDocument.create({
    data: {
      fileName: input.fileName,
      filePath: input.filePath,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      section: input.section as any,
      version,
      caseId: input.caseId || null,
      optInRequestId: input.optInRequestId || null,
      uploadedById: input.uploadedById,
    },
  });

  await logActivity({
    action: "document_uploaded",
    actorId: input.uploadedById,
    caseId: input.caseId,
    optInRequestId: input.optInRequestId,
    details: {
      fileName: input.fileName,
      section: input.section,
      version,
      fileSize: input.fileSize,
    },
  });

  return document;
}

export async function getDocument(id: string) {
  return prisma.caseDocument.findUnique({
    where: { id },
    include: {
      uploadedBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });
}

export async function deleteDocument(id: string, actorId: string) {
  const document = await prisma.caseDocument.findUnique({ where: { id } });
  if (!document) {
    throw new Error("Document not found");
  }

  // Delete file from disk
  try {
    fs.unlinkSync(document.filePath);
  } catch (err) {
    // File may already be deleted; log but continue
    console.warn("Could not delete file from disk:", document.filePath, err);
  }

  await logActivity({
    action: "document_deleted",
    actorId,
    caseId: document.caseId || undefined,
    optInRequestId: document.optInRequestId || undefined,
    details: {
      fileName: document.fileName,
      section: document.section,
    },
  });

  await prisma.caseDocument.delete({ where: { id } });

  return { success: true };
}
