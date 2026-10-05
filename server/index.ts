import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { handleSubscribeEmail, handleSubscribePhone } from "./routes/subscribe";

export function createServer() {
  const app: Express = express();

  // Middleware
  // Same-origin by default; cross-origin browser calls only from the site itself
  // (and local dev / Netlify deploy previews) so other sites can't drive /api/*.
  app.use(
    cors({
      origin: [
        /^https:\/\/(www\.)?ennisslingshot\.com$/,
        /^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.netlify\.app$/,
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
      ],
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static blog files (generated at build time)
  // This allows /blog/[slug]/ static HTML files to be served directly
  app.use("/blog", express.static(path.join(process.cwd(), "dist", "blog")));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Mailing list (Sender) — see server/routes/subscribe.ts for required env vars
  app.post("/api/subscribe", handleSubscribeEmail);
  app.post("/api/subscribe/phone", handleSubscribePhone);

  return app;
}
