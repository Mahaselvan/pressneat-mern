import express from "express";
import multer from "multer";
import { promises as fs } from "fs";
import OpenAI from "openai";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    return cb(null, true);
  },
});

const buildPrompt = () => `
Analyze this clothes image for ironing pickup.
Return STRICT JSON with this exact schema:
{
  "fabric": "short summary",
  "count": number,
  "price": number,
  "eco_score": "string percentage",
  "items": [
    { "type": "shirt|pant|saree|uniform|other", "count": number, "price_per_piece": number }
  ]
}

Pricing rules:
- shirt: 15
- pant: 20
- saree: 50
- uniform: 15
- other: 12
- "price" must be total estimated price from items.
- "count" must be total piece count.
- If uncertain, make best estimate and keep a valid JSON response.
`.trim();

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Image is required" });
  }

  if (!process.env.OPENAI_API_KEY) {
    await fs.unlink(req.file.path).catch(() => {});
    return res.status(503).json({
      error: "AI scanner unavailable: OPENAI_API_KEY is not configured on server",
      code: "OPENAI_KEY_MISSING",
    });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const imageBase64 = await fs.readFile(req.file.path, { encoding: "base64" });
    const mimeType = req.file.mimetype || "image/jpeg";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: buildPrompt(),
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: "AI response was empty" });
    }

    const parsed = JSON.parse(content);
    if (!Number.isFinite(parsed.count) || !Number.isFinite(parsed.price)) {
      return res.status(502).json({ error: "AI response is missing expected numeric fields" });
    }

    return res.json({
      fabric: parsed.fabric || "Mixed garments",
      count: parsed.count,
      price: parsed.price,
      eco_score: parsed.eco_score || "N/A",
      items: Array.isArray(parsed.items) ? parsed.items : [],
    });
  } catch (error) {
    console.error("AI scanner error:", error);
    const errorCode = error?.code || error?.error?.code;
    const errorType = error?.type || error?.error?.type;
    const status = Number(error?.status) || 500;

    if (status === 429 || errorCode === "insufficient_quota" || errorType === "insufficient_quota") {
      return res.status(429).json({
        error: "AI quota exceeded. Please recharge or upgrade your OpenAI billing plan.",
        code: "AI_QUOTA_EXCEEDED",
      });
    }

    if (status === 401 || errorCode === "invalid_api_key") {
      return res.status(401).json({
        error: "Invalid OpenAI API key configuration.",
        code: "OPENAI_KEY_INVALID",
      });
    }

    return res.status(500).json({
      error: "AI scan failed",
      code: "AI_SCAN_FAILED",
    });
  } finally {
    await fs.unlink(req.file.path).catch(() => {});
  }
});

export default router;
