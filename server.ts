import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import admin from "firebase-admin";

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

  // Initialize firebase-admin Firestore securely
  let adminDbServer: admin.firestore.Firestore | null = null;
  try {
    if (admin.apps.length === 0) {
      admin.initializeApp();
    }
    adminDbServer = admin.firestore();
    console.log("[Firestore Admin] Successfully initialized Firestore database connection.");
  } catch (error) {
    console.warn("[Firestore Admin] Failed to initialize firebase-admin Firestore, using local fallback.", error);
  }

  // Handle lead submission with Firebase database storage and direct transaction email delivery
  app.post("/api/leads", async (req, res) => {
    try {
      const { fullName, phone, email, suburb, serviceType, notes, urgency, ticketId, source } = req.body;

      if (!fullName || !phone || !suburb) {
        return res.status(400).json({ error: "Required fields are missing: fullName, phone, and suburb are mandatory." });
      }

      const generatedTicketId = ticketId || 'WA-' + Math.floor(100000 + Math.random() * 900000);

      const leadPayload = {
        fullName,
        phone,
        email: email || "",
        suburb,
        serviceType: serviceType || "Unspecified Service",
        notes: notes || "",
        urgency: urgency || "Standard",
        ticketId: generatedTicketId,
        source: source || "General Contact",
        createdAt: new Date().toISOString()
      };

      // 1. Save directly to Firestore leads collection with admin privileges
      let firestoreStatus = "Not available";
      if (adminDbServer) {
        try {
          await adminDbServer.collection("leads").doc(generatedTicketId).set(leadPayload);
          firestoreStatus = "Saved successfully";
          console.log(`[Firestore Admin] Saved lead ticket ${generatedTicketId}`);
        } catch (dbErr: any) {
          console.error("[Firestore Admin] Error storing lead:", dbErr);
          firestoreStatus = `Error: ${dbErr.message || dbErr}`;
        }
      }

      // 2. Dispatch real email notifications to the configured recipient (defaults to GabrielJRussell@gmail.com)
      let emailStatus = "No API key configured";
      const resendApiKey = process.env.RESEND_API_KEY;

      if (resendApiKey) {
        const recipient = process.env.RESEND_TO_EMAIL || "GabrielJRussell@gmail.com";
        const sender = process.env.RESEND_FROM_EMAIL || "Perth BoreWater Dispatch <onboarding@resend.dev>";
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="background-color: #007aff; color: #ffffff; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; tracking-wider: 1px;">Perth BoreWater dispatch</span>
            </div>
            <h2 style="color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-top: 0; text-align: center; font-size: 20px;">New Customer Site Service Lead</h2>
            
            <p style="font-size: 14px; color: #475569; text-align: center;">A property owner has submitted a query requesting borehole service. The lead details are enclosed below:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #475569; border-bottom: 1px solid #f1f5f9; width: 140px;">Reservation ID:</td>
                <td style="padding: 10px 0; color: #007aff; font-family: monospace; font-weight: bold; border-bottom: 1px solid #f1f5f9;">${generatedTicketId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #475569; border-bottom: 1px solid #f1f5f9;">CTA Trigger:</td>
                <td style="padding: 10px 0; color: #1e293b; border-bottom: 1px solid #f1f5f9;">${source}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #475569; border-bottom: 1px solid #f1f5f9;">Client Name:</td>
                <td style="padding: 10px 0; color: #1e293b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #475569; border-bottom: 1px solid #f1f5f9;">Phone Line:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;"><a href="tel:${phone}" style="color: #007aff; text-decoration: none; font-weight: 600;">${phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #475569; border-bottom: 1px solid #f1f5f9;">Email Contact:</td>
                <td style="padding: 10px 0; color: #1e293b; border-bottom: 1px solid #f1f5f9;">${email || '<em>No email provided</em>'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #475569; border-bottom: 1px solid #f1f5f9;">Target Suburb:</td>
                <td style="padding: 10px 0; color: #007aff; font-weight: bold; border-bottom: 1px solid #f1f5f9;">${suburb}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #475569; border-bottom: 1px solid #f1f5f9;">Service Requested:</td>
                <td style="padding: 10px 0; color: #334155; border-bottom: 1px solid #f1f5f9;">${serviceType}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #475569; border-bottom: 1px solid #f1f5f9;">Urgency Level:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                  <span style="background-color: ${urgency === 'emergency' ? '#fef2f2' : '#f0fdf4'}; color: ${urgency === 'emergency' ? '#991b1b' : '#166534'}; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase;">${urgency}</span>
                </td>
              </tr>
            </table>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-top: 16px;">
              <h4 style="margin-top: 0; margin-bottom: 8px; color: #475569; font-size: 12px; text-transform: uppercase; font-family: monospace; letter-spacing: 0.5px;">Client Site Details / System Notes:</h4>
              <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.5; font-style: italic;">"${notes || 'No notes provided.'}"</p>
            </div>
            
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
              This notification email was safely bypassed to your business email inbox.<br/>
              Perth BoreWater Digital Platform • Registered in Cloud Run Sandbox
            </p>
          </div>
        `;

        try {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: sender,
              to: [recipient],
              subject: `[PB LEAD DISPATCH] ${fullName} - ${suburb} (${urgency.toUpperCase()})`,
              html: emailHtml
            })
          });

          if (emailResponse.ok) {
            emailStatus = `Sent successfully via Resend API to ${recipient}`;
            console.log(`[Email Service] Success dispatch to ${recipient}`);
          } else {
            const errText = await emailResponse.text();
            emailStatus = `Failed: Resend API response: ${errText}`;
            console.error(`[Email Service] Resend API rejected dispatch:`, errText);
          }
        } catch (emailErr: any) {
          emailStatus = `Error: ${emailErr.message || emailErr}`;
          console.error(`[Email Service] Execution exception:`, emailErr);
        }
      } else {
        console.warn("[Email Service] RESEND_API_KEY is not defined. No email will be sent; saving to Firestore only.");
      }

      res.json({
        success: true,
        ticketId: generatedTicketId,
        firestoreStatus,
        emailStatus,
        lead: leadPayload
      });
    } catch (apiErr: any) {
      console.error("[Leads API Error]:", apiErr);
      res.status(500).json({ error: apiErr.message || "An internal error occurred saving lead." });
    }
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
