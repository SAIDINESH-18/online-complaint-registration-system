import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./server/db.js";
import apiRoutes from "./server/routes.js";

async function startServer() {
  // Initialize Database (Atlas connection or local JSON DB fallback)
  await connectDB();

  const app = express();
  const PORT = 3000;

  // Security Middlewares
  app.use(cors());
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable CSP to allow dynamic fonts, images, and Vite assets
      crossOriginEmbedderPolicy: false,
    })
  );

  // Increase limit for supporting base64 image uploads for complaint attachments
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  // API Endpoints
  app.use("/api", apiRoutes);

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode with static file delivery...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`==================================================================`);
    console.log(` ONLINE COMPLAINT REGISTRATION AND MANAGEMENT SYSTEM IS RUNNING   `);
    console.log(` URL: http://0.0.0.0:${PORT}                                      `);
    console.log(`==================================================================`);
  });
}

startServer().catch((err) => {
  console.error("Critical error starting Express-Vite backend server:", err);
});
