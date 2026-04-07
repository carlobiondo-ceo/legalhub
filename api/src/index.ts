import express from "express";
import cors from "cors";
import { config } from "./config";

const app = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(config.port, () => {
  console.log(`API server running on port ${config.port}`);
});
