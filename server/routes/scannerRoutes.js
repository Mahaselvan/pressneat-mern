import express from "express";
import multer from "multer";
import { promises as fs } from "fs";
import fsSync from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");
const detectScriptPath = path.resolve(__dirname, "../ai/detect.py");
const pythonBin = process.env.PYTHON_BIN || "python3";

if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
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

const runDetection = (imagePath) =>
  new Promise((resolve, reject) => {
    const child = spawn(pythonBin, [detectScriptPath, imagePath], {
      cwd: path.resolve(__dirname, ".."),
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || `Detection script exited with code ${code}`));
      }

      // Ultralytics can print extra lines; parse the last JSON-looking line.
      const lines = stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      const jsonLine = [...lines].reverse().find((line) => line.startsWith("{") && line.endsWith("}"));
      if (!jsonLine) {
        return reject(new Error("Detection output did not contain valid JSON"));
      }

      try {
        const parsed = JSON.parse(jsonLine);
        return resolve(parsed);
      } catch {
        return reject(new Error("Failed to parse detection JSON output"));
      }
    });
  });

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Image is required", code: "IMAGE_MISSING" });
  }

  if (!fsSync.existsSync(detectScriptPath)) {
    await fs.unlink(req.file.path).catch(() => {});
    return res.status(500).json({
      error: "AI scanner script not found at server/ai/detect.py",
      code: "DETECT_SCRIPT_MISSING",
    });
  }

  try {
    const result = await runDetection(req.file.path);

    return res.json({
      fabric: result.fabric || "Detected garments",
      count: Number.isFinite(result.count) ? result.count : 0,
      price: Number.isFinite(result.price) ? result.price : Number(result.estimated_price) || 0,
      eco_score: result.eco_score || "N/A",
      items: Array.isArray(result.items) ? result.items : [],
      raw_items: Array.isArray(result.raw_items) ? result.raw_items : [],
    });
  } catch (error) {
    console.error("Local AI scanner error:", error);

    const message = String(error?.message || "");
    if (message.includes("No module named") || message.includes("ultralytics")) {
      return res.status(503).json({
        error: "Python dependency missing. Install with: pip install ultralytics",
        code: "PYTHON_DEPENDENCY_MISSING",
      });
    }

    if (message.includes("not recognized") || message.includes("ENOENT")) {
      return res.status(503).json({
        error: "Python not found. Install Python or set PYTHON_BIN env var.",
        code: "PYTHON_NOT_FOUND",
      });
    }

    return res.status(500).json({
      error: "Local AI scan failed",
      code: "LOCAL_AI_SCAN_FAILED",
    });
  } finally {
    await fs.unlink(req.file.path).catch(() => {});
  }
});

export default router;
