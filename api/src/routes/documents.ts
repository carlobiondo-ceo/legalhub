import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "../middleware/auth";
import { config } from "../config";
import {
  uploadDocument,
  getDocument,
  deleteDocument,
} from "../services/documentService";

const router = Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Upload document
router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { section, caseId, optInRequestId } = req.body;

      if (!section) {
        return res.status(400).json({ error: "Section is required" });
      }

      if (!caseId && !optInRequestId) {
        return res
          .status(400)
          .json({ error: "Either caseId or optInRequestId is required" });
      }

      const document = await uploadDocument({
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        section,
        caseId: caseId || undefined,
        optInRequestId: optInRequestId || undefined,
        uploadedById: req.session.userId!,
      });

      res.status(201).json(document);
    } catch (err) {
      console.error("Error uploading document:", err);
      res.status(500).json({ error: "Failed to upload document" });
    }
  }
);

// Download document
router.get("/:id/download", requireAuth, async (req: Request, res: Response) => {
  try {
    const document = await getDocument(req.params.id);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.download(document.filePath, document.fileName);
  } catch (err) {
    console.error("Error downloading document:", err);
    res.status(500).json({ error: "Failed to download document" });
  }
});

// Delete document
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    await deleteDocument(req.params.id, req.session.userId!);
    res.json({ success: true });
  } catch (err: any) {
    if (err.message === "Document not found") {
      return res.status(404).json({ error: "Document not found" });
    }
    console.error("Error deleting document:", err);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

export default router;
