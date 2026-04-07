import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { getStats, getUpcomingDeadlines } from "../services/dashboardService";
import { getRecentActivity } from "../services/activityService";

const router = Router();

// Dashboard stats
router.get("/stats", requireAuth, async (_req: Request, res: Response) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    console.error("Error getting dashboard stats:", err);
    res.status(500).json({ error: "Failed to get dashboard stats" });
  }
});

// Upcoming deadlines
router.get("/deadlines", requireAuth, async (_req: Request, res: Response) => {
  try {
    const deadlines = await getUpcomingDeadlines();
    res.json(deadlines);
  } catch (err) {
    console.error("Error getting deadlines:", err);
    res.status(500).json({ error: "Failed to get deadlines" });
  }
});

// Recent activity feed
router.get("/activity", requireAuth, async (_req: Request, res: Response) => {
  try {
    const activity = await getRecentActivity(20);
    res.json(activity);
  } catch (err) {
    console.error("Error getting recent activity:", err);
    res.status(500).json({ error: "Failed to get recent activity" });
  }
});

export default router;
