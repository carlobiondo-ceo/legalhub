import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";
import { config } from "../config";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(null, false, { message: "No email in Google profile" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return done(null, false, { message: "User not authorized" });
        }

        // Update avatar if available
        const avatarUrl = profile.photos?.[0]?.value;
        if (avatarUrl && avatarUrl !== user.avatarUrl) {
          await prisma.user.update({
            where: { id: user.id },
            data: { avatarUrl },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// Initiate Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${config.frontendUrl}/login?error=unauthorized` }),
  (req, res) => {
    const user = req.user as any;
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.userAvatar = user.avatarUrl;
    res.redirect(config.frontendUrl);
  }
);

// Get current user
router.get("/me", (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({
    id: req.session.userId,
    name: req.session.userName,
    email: req.session.userEmail,
    role: req.session.userRole,
    avatarUrl: req.session.userAvatar,
  });
});

// Logout
router.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
    });
    res.json({ success: true });
  });
});

// List all users (for dropdowns)
router.get("/users", requireAuth, async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, avatarUrl: true },
    orderBy: { name: "asc" },
  });
  res.json(users);
});

export default router;
