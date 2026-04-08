import express from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import casesRoutes from "./routes/cases";
import optInRoutes from "./routes/optInRequests";
import documentRoutes from "./routes/documents";
import dashboardRoutes from "./routes/dashboard";

const app = express();

const isProduction = process.env.NODE_ENV === "production";

// Trust first proxy (nginx) when running behind a reverse proxy in production
if (isProduction) {
  app.set("trust proxy", 1);
}

// CORS
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

app.use(express.json());

// Sessions with PostgreSQL store
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      conString: config.databaseUrl,
      createTableIfMissing: true,
    }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: isProduction, // HTTPS-only cookies in production
      sameSite: "lax",
    },
  })
);

// Passport (stateless — we manage sessions manually)
app.use(passport.initialize());

// Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/cases", casesRoutes);
app.use("/api/opt-in-requests", optInRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`API server running on port ${config.port}`);
});
