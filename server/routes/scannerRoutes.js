import express from "express";
import multer from "multer";
import { promises as fs } from "fs";
import fsSync from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");
const hfModel = process.env.HF_MODEL || "Salesforce/blip-image-captioning-base";
const configuredHfApiUrl = (process.env.HF_API_URL || "").trim();
const hfApiUrl = configuredHfApiUrl
  ? configuredHfApiUrl.replace(
      "https://api-inference.huggingface.co/models/",
      "https://router.huggingface.co/hf-inference/models/"
    )
  : `https://router.huggingface.co/hf-inference/models/${hfModel}`;

if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const extFromName = path.extname(file.originalname || "").toLowerCase();
    const extFromMime = file.mimetype?.startsWith("image/")
      ? `.${file.mimetype.split("/")[1].split("+")[0]}`
      : "";
    const ext = extFromName || extFromMime || ".jpg";
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
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

const numberWords = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

const pickCaption = (payload) => {
  if (Array.isArray(payload) && payload.length > 0) {
    const first = payload[0];
    if (typeof first === "string") return first;
    if (first && typeof first.generated_text === "string") return first.generated_text;
    if (first && typeof first.summary_text === "string") return first.summary_text;
  }

  if (payload && typeof payload.generated_text === "string") return payload.generated_text;
  if (payload && typeof payload.summary_text === "string") return payload.summary_text;
  if (typeof payload === "string") return payload;

  return "";
};

const pickFabricType = (caption) => {
  const text = caption.toLowerCase();
  if (text.includes("cotton")) return "Cotton";
  if (text.includes("denim")) return "Denim";
  if (text.includes("silk")) return "Silk";
  if (text.includes("wool")) return "Wool";
  if (text.includes("linen")) return "Linen";
  if (text.includes("polyester")) return "Polyester";
  return "Mixed fabric";
};

const pickPieceTypeAndPrice = (caption) => {
  const text = caption.toLowerCase();
  const catalog = [
    { regex: /\b(t-?shirt|shirt|blouse|top)\b/, type: "Shirt/Top", unitPrice: 80 },
    { regex: /\b(jeans|trousers?|pants?)\b/, type: "Pants", unitPrice: 100 },
    { regex: /\b(saree|sari)\b/, type: "Saree", unitPrice: 150 },
    { regex: /\b(kurta|kurti)\b/, type: "Kurta", unitPrice: 120 },
    { regex: /\b(dress|gown)\b/, type: "Dress", unitPrice: 140 },
    { regex: /\b(jacket|coat)\b/, type: "Jacket/Coat", unitPrice: 180 },
    { regex: /\b(hoodie|sweater)\b/, type: "Hoodie/Sweater", unitPrice: 160 },
    { regex: /\b(shorts?|skirt)\b/, type: "Shorts/Skirt", unitPrice: 90 },
  ];

  const match = catalog.find((item) => item.regex.test(text));
  if (match) return match;

  return { type: "Mixed garments", unitPrice: 100 };
};

const pickPieceCount = (caption) => {
  const text = caption.toLowerCase();
  const numericMatch = text.match(/\b([1-9]|10)\b/);
  if (numericMatch) return Number(numericMatch[1]);

  for (const [word, value] of Object.entries(numberWords)) {
    if (text.includes(word)) return value;
  }

  return 1;
};

const pickEcoScore = (fabricType) => {
  if (["Cotton", "Linen"].includes(fabricType)) return "A";
  if (["Silk", "Wool", "Denim"].includes(fabricType)) return "B";
  if (fabricType === "Polyester") return "C";
  return "B";
};

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Image is required", code: "IMAGE_MISSING" });
  }

  try {
    const hfApiToken = process.env.HF_API_TOKEN;
    if (!hfApiToken) {
      return res.status(500).json({
        error: "HF_API_TOKEN is missing in server environment",
        code: "HF_CONFIG_MISSING",
      });
    }

    const imageBuffer = await fs.readFile(req.file.path);
    const response = await fetch(hfApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfApiToken}`,
        "Content-Type": req.file.mimetype || "application/octet-stream",
      },
      body: imageBuffer,
    });

    let payload = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await response.json();
    } else {
      payload = await response.text();
    }

    if (!response.ok) {
      const messageFromProvider =
        (payload && typeof payload === "object" && payload.error) ||
        (typeof payload === "string" ? payload : "");
      const providerErrorDetails = String(messageFromProvider || "Unknown provider error");

      console.error("Hugging Face API non-OK response", {
        hfApiUrl,
        model: hfModel,
        status: response.status,
        details: providerErrorDetails,
      });

      if (
        response.status === 503 ||
        providerErrorDetails.toLowerCase().includes("loading")
      ) {
        return res.status(503).json({
          error: "Hugging Face model is loading. Please retry in a few seconds.",
          code: "HF_MODEL_LOADING",
          details: providerErrorDetails,
        });
      }

      return res.status(502).json({
        error: "Hugging Face API request failed",
        code: "HF_API_FAILED",
        provider_status: response.status,
        details: providerErrorDetails,
      });
    }

    const caption = pickCaption(payload);
    const normalizedCaption = caption.trim() || "garments in image";
    const pieceMeta = pickPieceTypeAndPrice(normalizedCaption);
    const pieceCount = Math.max(1, Math.min(10, pickPieceCount(normalizedCaption)));
    const fabricType = pickFabricType(normalizedCaption);
    const ecoScore = pickEcoScore(fabricType);
    const estimatedPrice = pieceMeta.unitPrice * pieceCount;

    return res.json({
      fabric: fabricType,
      count: pieceCount,
      price: estimatedPrice,
      eco_score: ecoScore,
      items: [{ type: pieceMeta.type, count: pieceCount, price_per_piece: pieceMeta.unitPrice }],
      raw_caption: normalizedCaption,
    });
  } catch (error) {
    console.error("Hugging Face scanner error:", error);

    return res.status(500).json({
      error: "Scanner failed while processing with Hugging Face API",
      code: "HF_SCAN_FAILED",
    });
  } finally {
    await fs.unlink(req.file.path).catch(() => {});
  }
});

export default router;

