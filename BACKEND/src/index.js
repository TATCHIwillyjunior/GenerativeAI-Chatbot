import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";

import { authMiddleware, loginHandler } from "./auth.js";
import { extractAudioFeatures } from "./audioProcessor.js";
import { explainNoiseWithAI } from "./genAIService.js";

dotenv.config();
const app = express();

function parseAIResponse(text) {
  const cleaned = text.trim();
  const riskMatch = cleaned.match(/Risk\s*[:\-]?\s*(low|medium|high)/i);
  if (riskMatch) {
    return { explanation: cleaned, risk: riskMatch[1].toLowerCase() };
  }

  const dangerMatch = cleaned.match(/Is it dangerous\??\s*[:\-]?\s*([\s\S]*?)(?=\n[A-Z][a-z]+|$)/i);
  const dangerText = dangerMatch ? dangerMatch[1].trim() : cleaned;

  const negative = /\b(no|not|none|unlikely|safe|harmless)\b/i.test(dangerText);
  const mediumWords = /\b(possibly|maybe|could|potential|monitor|check|inspect|evaluate|might|might be|possible issue)\b/i;
  const highWords = /\b(urgent|immediate|dangerous|danger|hazard|leak|burst|electrical|fire|injury|damage)\b/i;

  let risk = "low";
  if (highWords.test(dangerText) && !negative) {
    risk = "high";
  } else if (mediumWords.test(dangerText)) {
    risk = "medium";
  } else if (negative) {
    risk = "low";
  }

  return { explanation: cleaned, risk };
}

const upload = multer({
  dest: "tmp-audio/",
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(cors());
app.use(express.json());

app.post("/login", loginHandler);

app.post("/analyze-sound", authMiddleware, upload.single("audio"), async (req, res) => {
  console.log("BACKEND /analyze-sound called", {
    authHeader: !!req.headers.authorization,
    file: req.file?.originalname,
    mimeType: req.file?.mimetype,
  });

  if (!req.file) {
    console.error("BACKEND analyze-sound no file received");
    return res.status(400).json({ error: "No audio file" });
  }

  const filePath = req.file.path;

  try {
    const features = await extractAudioFeatures(filePath);
    fs.unlink(filePath, () => {});
    res.json({ features });
  } catch (err) {
    console.error("BACKEND analyze-sound failed:", err);
    fs.unlink(filePath, () => {});
    res.status(500).json({ error: "Audio processing failed" });
  }
});

app.post("/explain-noise", authMiddleware, async (req, res) => {
  const { features, context } = req.body;

  const explanation = await explainNoiseWithAI(features, context);
  console.log("BACKEND /explain-noise response:", explanation);

  const { risk } = parseAIResponse(explanation);

  const suggestion =
    risk === "high"
      ? "This may require urgent attention. Consider calling a technician."
      : risk === "medium"
      ? "Monitor the sound and check the area for issues."
      : "This sound appears harmless.";

  console.log("BACKEND /explain-noise risk:", risk);
  console.log("BACKEND /explain-noise suggestion:", suggestion);

  res.json({ explanation, risk, suggestion });
});

// Generic error logger for middleware and route failures
app.use((err, req, res, next) => {
  console.error("BACKEND unhandled error:", err);

  if (err.name === "MulterError") {
    console.error("BACKEND multer error:", err.code, err.message);
    return res.status(400).json({ error: err.message || "File upload error" });
  }

  res.status(500).json({ error: err.message || "Internal Server Error" });
});

app.listen(process.env.PORT || 3001, () =>
  console.log("Backend running on port 3001")
);
