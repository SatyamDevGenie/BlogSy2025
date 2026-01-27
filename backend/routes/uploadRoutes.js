import express from "express";
import multer from "multer";
import path from "path";
import { storage } from "../utils/cloudinary.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Cloudinary storage (primary)
const cloudinaryUpload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Local storage (fallback)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const localUpload = multer({ 
  storage: localStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Primary upload route (Cloudinary with local fallback)
router.post("/", protect, cloudinaryUpload.single("image"), (req, res) => {
  try {
    console.log("Upload request received");
    console.log("File:", req.file);
    console.log("Body:", req.body);

    if (!req.file) {
      console.log("No file received, attempting local upload fallback");
      
      // Try local upload as fallback
      return localUpload.single("image")(req, res, (err) => {
        if (err) {
          console.error("Local upload error:", err);
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).json({ message: "File too large. Maximum size is 10MB." });
            }
          }
          return res.status(400).json({ message: err.message || "File upload error" });
        }

        if (!req.file) {
          return res.status(400).json({ message: "No image file provided. Please select an image file." });
        }

        const localPath = `http://localhost:5000/uploads/${req.file.filename}`;
        console.log("Image uploaded locally:", localPath);
        return res.json({ 
          success: true,
          filePath: localPath,
          message: "Image uploaded successfully (local storage)"
        });
      });
    }

    console.log("Image uploaded to Cloudinary:", req.file.path);
    res.json({ 
      success: true,
      filePath: req.file.path,
      message: "Image uploaded successfully"
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ 
      message: "Image upload failed", 
      error: error.message 
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



