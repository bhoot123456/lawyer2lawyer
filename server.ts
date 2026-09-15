import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const backendApp = require("./backend/index.js");

async function startServer() {
  const PORT = 3000;

  // In development, mount Vite middleware after API routes
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    backendApp.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    backendApp.use(express.static(distPath));
    backendApp.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  backendApp.listen(PORT, "0.0.0.0", () => {
    console.log(`Lawyer2Lawyer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Lawyer2Lawyer server:", err);
  process.exit(1);
});
