import { Router, Request, Response } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import {
  createCase,
  getCase,
  listCases,
  updateCase,
  deleteCase,
} from "../services/caseService";

const router = Router();

// List cases with pagination, search, and filters
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      page,
      limit,
      search,
      status,
      caseType,
      riskLevel,
      jurisdiction,
      assignedToId,
      dateFrom,
      dateTo,
    } = req.query;

    // Accept either repeated params (?status=a&status=b) or comma-separated (?status=a,b)
    const parseMulti = (v: unknown): string[] | undefined => {
      if (!v) return undefined;
      if (Array.isArray(v)) return v.flatMap((x) => String(x).split(",")).filter(Boolean);
      return String(v).split(",").filter(Boolean);
    };

    const result = await listCases({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
      status: parseMulti(status),
      caseType: parseMulti(caseType),
      riskLevel: parseMulti(riskLevel),
      jurisdiction: jurisdiction as string,
      assignedToId: assignedToId as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    });

    res.json(result);
  } catch (err) {
    console.error("Error listing cases:", err);
    res.status(500).json({ error: "Failed to list cases" });
  }
});

// Get single case
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const legalCase = await getCase(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ error: "Case not found" });
    }
    res.json(legalCase);
  } catch (err) {
    console.error("Error getting case:", err);
    res.status(500).json({ error: "Failed to get case" });
  }
});

// Create case
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const legalCase = await createCase(req.body, req.session.userId!);
    res.status(201).json(legalCase);
  } catch (err) {
    console.error("Error creating case:", err);
    res.status(500).json({ error: "Failed to create case" });
  }
});

// Update case
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const updated = await updateCase(req.params.id, req.body, req.session.userId!);
    res.json(updated);
  } catch (err: any) {
    if (err.message === "Case not found") {
      return res.status(404).json({ error: "Case not found" });
    }
    console.error("Error updating case:", err);
    res.status(500).json({ error: "Failed to update case" });
  }
});

// Delete case (admin only)
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    await deleteCase(req.params.id, req.session.userId!);
    res.json({ success: true });
  } catch (err: any) {
    if (err.message === "Case not found") {
      return res.status(404).json({ error: "Case not found" });
    }
    console.error("Error deleting case:", err);
    res.status(500).json({ error: "Failed to delete case" });
  }
});

export default router;
