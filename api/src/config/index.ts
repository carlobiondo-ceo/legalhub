export const config = {
  port: parseInt(process.env.API_PORT || "3001", 10),
  sessionSecret: process.env.SESSION_SECRET || "dev-secret-change-me",
  databaseUrl: process.env.DATABASE_URL || "",
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3001/api/auth/google/callback",
  },
  frontendUrl: "http://localhost:3000",
  uploadsDir: "/app/uploads",
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || "carlo@audienceserv.com",
    adminName: process.env.SEED_ADMIN_NAME || "Carlo Biondo",
    legalEmail: process.env.SEED_LEGAL_EMAIL || "hue@audienceserv.com",
    legalName: process.env.SEED_LEGAL_NAME || "Hue",
  },
};
