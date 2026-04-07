import { Router, Request, Response } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import {
  createOptInRequest,
  getOptInRequest,
  listOptInRequests,
  updateOptInRequest,
  deleteOptInRequest,
} from "../services/optInService";

const router = Router();

// List opt-in requests with pagination, search, and filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const { page, limit, search, status, dateFrom, dateTo } = req.query;

    const result = await listOptInRequests({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
      status: status ? (Array.isArray(status) ? (status as string[]) : [status as string]) : undefined,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    });

    res.json(result);
  } catch (err) {
    console.error("Error listing opt-in requests:", err);
    res.status(500).json({ error: "Failed to list opt-in requests" });
  }
});

// Get single opt-in request
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const optIn = await getOptInRequest(req.params.id);
    if (!optIn) {
      return res.status(404).json({ error: "Opt-in request not found" });
    }
    res.json(optIn);
  } catch (err) {
    console.error("Error getting opt-in request:", err);
    res.status(500).json({ error: "Failed to get opt-in request" });
  }
});

// Create opt-in request
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const optIn = await createOptInRequest(req.body, req.session.userId!);
    res.status(201).json(optIn);
  } catch (err) {
    console.error("Error creating opt-in request:", err);
    res.status(500).json({ error: "Failed to create opt-in request" });
  }
});

// Update opt-in request
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const updated = await updateOptInRequest(
      req.params.id,
      req.body,
      req.session.userId!
    );
    res.json(updated);
  } catch (err: any) {
    if (err.message === "Opt-in request not found") {
      return res.status(404).json({ error: "Opt-in request not found" });
    }
    console.error("Error updating opt-in request:", err);
    res.status(500).json({ error: "Failed to update opt-in request" });
  }
});

// Delete opt-in request (admin only)
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    await deleteOptInRequest(req.params.id, req.session.userId!);
    res.json({ success: true });
  } catch (err: any) {
    if (err.message === "Opt-in request not found") {
      return res.status(404).json({ error: "Opt-in request not found" });
    }
    console.error("Error deleting opt-in request:", err);
    res.status(500).json({ error: "Failed to delete opt-in request" });
  }
});

export default router;
