import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadBuffer } from "../utils/cloudinary.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
// Same folder as express.static('uploads') in server.js (relative to process.cwd())
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Single multer: memory storage so we read the file once, then upload in handler
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Upload route: receive file in memory, then Cloudinary or local fallback
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Please select an image file.",
      });
    }

    const { buffer, mimetype, originalname } = req.file;

    // 1. Try Cloudinary first
    const cloudinaryUrl = await uploadBuffer(buffer, mimetype);
    if (cloudinaryUrl) {
      return res.json({
        success: true,
        filePath: cloudinaryUrl,
        message: "Image uploaded successfully",
      });
    }

    // 2. Fallback: save to local uploads/
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    const ext = path.extname(originalname) || ".jpg";
    const filename = `image-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, buffer);

    const localUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
    return res.json({
      success: true,
      filePath: localUrl,
      message: "Image uploaded successfully (local storage)",
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Image upload failed",
    });
  }
});

// Handle multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: "File too large. Maximum size is 10MB." });
    }
    return res.status(400).json({ message: error.message });
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ message: "Only image files are allowed!" });
  }
  
  next(error);
});

export default router;



