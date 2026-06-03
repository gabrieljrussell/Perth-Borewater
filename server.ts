import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient() {
    if (!aiClient) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error("GEMINI_API_KEY environment variable is missing");
      }
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // API Endpoints
  app.get("/api/user-info", (req, res) => {
    const headers = req.headers;
    const emailHeader = 
      headers["x-goog-user-email"] || 
      headers["x-user-email"] || 
      headers["x-forwarded-email"] ||
      headers["x-authenticated-user-email"] ||
      headers["x-goog-authenticated-user-email"] ||
      headers["x-appengine-user-email"] ||
      "";
    
    let email = String(emailHeader).trim();
    if (email.includes(":")) {
      email = email.split(":").pop() || "";
    }
    
    // Comprehensive scan over all header values as a fail-safe fallback for automatic identification
    if (!email || email.trim().toLowerCase() !== 'gabrieljrussell@gmail.com') {
      for (const [key, val] of Object.entries(headers)) {
        const valStr = String(val).toLowerCase();
        if (valStr.includes("gabrieljrussell@gmail.com")) {
          console.log(`Fallback header match: Found gabrieljrussell email in header '${key}': ${val}`);
          email = "gabrieljrussell@gmail.com";
          break;
        }
      }
    }

    // Fallback/log headers to debug if needed
    console.log("Detected user email headers:", {
      email,
      'x-goog-user-email': headers['x-goog-user-email'],
      'x-user-email': headers['x-user-email'],
      'x-goog-authenticated-user-email': headers['x-goog-authenticated-user-email'],
      allHeadersCount: Object.keys(headers).length
    });

    res.json({ email });
  });

  // Dynamically resolve media_overrides.json regardless of the runtime directory, bundler status, or build location
  const getOverridesFilePath = (): string => {
    // 1. Try resolving relative to the workspace root directly
    const rootPath = path.resolve(process.cwd(), "src", "media_overrides.json");
    if (fs.existsSync(rootPath)) {
      return rootPath;
    }

    // 2. Try resolving relative to __dirname (dist) backup to workspace src directory
    const parentRootPath = path.resolve(__dirname, "..", "src", "media_overrides.json");
    if (fs.existsSync(parentRootPath)) {
      return parentRootPath;
    }

    // 3. Try resolving directly inside __dirname
    const localDir = path.resolve(__dirname, "src", "media_overrides.json");
    if (fs.existsSync(localDir)) {
      return localDir;
    }

    // Default fallback to workspace root path so it remains in src/ for git tracking
    return rootPath;
  };

  app.get("/api/persistent-media-overrides", async (req, res) => {
    let result: any = {};
    try {
      const filePath = getOverridesFilePath();
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf-8");
        result = JSON.parse(data);
      }
    } catch (error) {
      console.error("Error reading persistent media overrides:", error);
    }

    res.json(result);
  });

  app.get("/api/download-media-overrides", (req, res) => {
    try {
      const filePath = getOverridesFilePath();
      if (fs.existsSync(filePath)) {
        res.setHeader("Content-Disposition", 'attachment; filename="media_overrides.json"');
        res.setHeader("Content-Type", "application/json");
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
      } else {
        res.status(404).json({ error: "Media overrides file not found" });
      }
    } catch (error: any) {
      console.error("Error serving media overrides file download:", error);
      res.status(500).json({ error: error.message || "Failed to download media overrides file" });
    }
  });

  app.post("/api/persist-media-overrides", async (req, res) => {
    try {
      const overrides = req.body;
      if (typeof overrides !== "object" || overrides === null) {
        return res.status(400).json({ error: "Invalid overrides format" });
      }

      const filePath = getOverridesFilePath();
      const parentDir = path.dirname(filePath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      fs.writeFileSync(filePath, JSON.stringify(overrides, null, 2), "utf-8");
      console.log("Successfully persisted media overrides locally to:", filePath);

      res.json({ success: true, path: filePath });
    } catch (error: any) {
      console.error("Error saving persistent media overrides:", error);
      res.status(500).json({ error: error.message || "Failed to persist overrides" });
    }
  });

  app.post("/api/generate-narrative", async (req, res) => {
    try {
      const { name, postcode, sector, aquifer, landmark } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Suburb name is required" });
      }

      const client = getGeminiClient();
      
      const prompt = `Write an extremely comprehensive, highly professional, local geological and water bore drilling narrative for the Perth suburb of ${name} (Postcode ${postcode}).
Reference the soil landscape profile: "${sector}".
Specify key hydrogeological attributes of this particular geographic zone, including the local aquifer ("${aquifer}") and landmarks like "${landmark || 'the local corridor'}".
Provide detailed guidance outlining:
1. Soil structure and limestone or clay presence, and its impact on drilling torques.
2. The specific unconfined groundwater table depths and recommended casing/pumping configurations.
3. Precautions necessary for water quality issues in ${name}, such as iron staining (dissolved iron Fe2+ oxidation) risks, calcium carbonate scale buildup, or salinity wedge intrusion.
Maintain a formal, consulting tone suited for a premium local engineering firm, Perth BoreWater.
The word count MUST be approximately 300 words. Do not use generic placeholders. Highlight specific water sub-regions (e.g. Jandakot Mound, Gnangara Mound, Swan Estuary, Canning Plain) as geographically relevant. Provide actionable technical advice for property irrigation.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ narrative: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate narrative" });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
