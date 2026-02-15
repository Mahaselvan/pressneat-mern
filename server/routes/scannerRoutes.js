import express from "express";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), async (req, res) => {
  // Mock AI logic
  const mockResult = {
    fabric: "Cotton Shirt",
    count: Math.floor(Math.random() * 5) + 1,
    price: 120,
    eco_score: "85%"
  };

  res.json(mockResult);
});

export default router;
